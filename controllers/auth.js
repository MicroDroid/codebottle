const config = require('../config');
const redis = require('../redis');
const nodemailer = require('../nodemailer');
const helpers = require('../helpers');
const models = require('../models');
const ApiError = require('../errors/api-error');
const Sequelize = require('sequelize');

const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const axios = require('axios');
const simpleOAuth = require('simple-oauth2');

const githubOAuth = simpleOAuth.create({
	client: {
		id: '0d1b8a8f60c5e2070c45',
		secret: '08fe963ff66b25e435d68f33a57148e80c05e794',
	},
	auth: {
		tokenHost: 'https://github.com',
		tokenPath: '/login/oauth/access_token',
		authorizePath: '/login/oauth/authorize',
	}
});

module.exports = {
	login: async (ctx, next) => {
		const username = ctx.request.body.username;
		const password = ctx.request.body.password;

		if (!username || !password)
			throw new ApiError(401, 'Invalid username or password');

		const user = await models.user.findOne({
			where: {username},
			attributes: ['id', 'username', 'email', 'password', 'banned', 'activated'],
		});

		if (!user)
			throw new ApiError(401, 'Invalid username or password');

		const verified = await bcrypt.compare(password, user.password);

		if (!verified)
			throw new ApiError(401, 'Invalid username or password');
		
		ctx.body = {
			username: user.username,
			token: jwt.sign({
				id: user.id,
				priv: cryptojs.SHA256(user).toString(),
			}, config.jwt.secret, {expiresIn: '90d'}),
			expiresIn: 84600 * 90,
		};

		await next();
	},

	changePassword: async (ctx, next) => {
		const token = ctx.request.body.token;
		const password = ctx.request.body.password;

		if (!token)
			throw new ApiError(422, 'Token is missing');
		else if (!password)
			throw new ApiError(422, 'Password is missing');
		else if (password.length < 6)
			throw new ApiError(422, 'Password should be at least 6 characters');

		const reset = await models.passwordReset.findOne({
			where: {token: cryptojs.SHA256(token).toString()},
			attributes: ['id', 'email'],
		});

		if (!reset)
			throw new ApiError(422, 'Invalid token');

		const user = await reset.getUser();
		user.password = await bcrypt.hash(ctx.request.body.password, config.bcrypt.saltRounds);
		await user.save();

		await reset.destroy();

		ctx.status = 204;

		return next();
	},

	resetPassword: async (ctx, next) => {
		if (!(await helpers.verifyRecaptcha(ctx.request.body.recaptcha_token)))
			throw new ApiError(422, 'Invalid reCAPTCHA');

		const email = ctx.request.body.email;

		if (!email)
			throw new ApiError(422, 'Email is missing');

		const user = await models.user.findOne({
			where: {email},
			attributes: ['username', 'email', 'bio', 'banned', 'created_at'],
		});

		if (user) {
			const cacheKey = `users:${user.id}:password.reset`;

			if (!(await redis.getAsync(cacheKey))) {
				await redis.setAsync(cacheKey, 1, 'EX', 8 * 3600);
				const token = crypto.randomBytes(16).toString('hex');

				const existingReset = await user.getPasswordReset();
				if (existingReset) {
					existingReset.destroy();
				}

				await models.passwordReset.create({
					email,
					token: cryptojs.SHA256(token).toString(),
				});

				nodemailer.sendMail({
					from: '"CodeBottle" <noreply@codebottle.io>',
					to: user.email,
					subject: 'Verify your email',
					text: `Hi,

You have request a password reset for your account, please click here to proceed:

https://codebottle.io/change-password#${token}

Regards,

CodeBottle's Team.

-----------------------

Request origin:

IP address: ${ctx.ip}
Client: ${ctx.get('User-Agent')}
Time: ${(new Date()).toISOString()}
`,
					html: 
					`<div>
						<p>
							Hi,
						</p>
						<p>
							You have request a password reset for your account, please click here to proceed:
						</p>
						<a href="https://codebottle.io/change-password#${token}">
							https://codebottle.io/change-password#${token}
						</a>
						<p>
							Regards,<br/>
							<br/>
							CodeBottle's Team.
						</p>
						<p>
							-----------------------<br/>
							<br/>
							Request origin:<br/>
							<br/>
							IP address: ${ctx.ip}<br/>
							Client: ${ctx.get('User-Agent')}<br/>
							Time: ${(new Date()).toISOString()}<br/>
						</p>
					</div>`
				});
			}
		}

		ctx.status = 204;
		
		return next();
	},

	github: async (ctx, next) => {
		const code = ctx.request.body.code;

		if (!code)
			throw new ApiError(422, 'Invalid authorization code!');

		const token = await githubOAuth.authorizationCode.getToken({code});
		const response = await axios.get(`https://api.github.com/user?access_token=${token.access_token}`)
			.catch(error => {
				if (error.response && error.response.data)
					logger.warn(`GitHub OAuth2.0 failed: [${error.response.status}] ${error.response.data.message}`);
				else
					logger.err('GitHub OAuth2.0 failed: Network error');

				throw new ApiError(422, 'Error retrieving GitHub data');
			});

		let socialConnection = 	await models.socialConnection.findOne({
			where: {service: 'github',  service_id: response.data.id},
			attributes: ['id', 'user_id', 'service', 'service_id', 'token', 'token_type'],
		});

		if (socialConnection) {
			const user = socialConnection.getUser();
			socialConnection.token = token.access_token;
			await socialConnection.save();

			ctx.body = {
				username: user.username,
				expires_in: 84600 * 90,
				token_type: 'Bearer',
				token: jwt.sign({
					id: user.id,
					priv: cryptojs.SHA256(user).toString(),
				}, config.jwt.secret, {expiresIn: '90d'}),
			};
		} else {
			const usernameRegex = /[^0-9A-Za-z]/g;
			let username = response.data.login.replace(usernameRegex, '')
				.substr(0,16)
				.padEnd(3, '0');

			let existingUser = await models.user.findOne({
				where: {
					[Sequelize.Op.or]: [
						{username},
						{email: response.data.email},
					]
				},
				attributes: ['id', 'username', 'email'],
			});

			if (existingUser)
				throw new ApiError(422, 'Username/Email is already taken');

			// This is probably a better solution but it scares me,
			// It feels like it can be easily broken

			// try {
			// 	do {
			// 		existingUser = await models.user.findOne({
			// 			where: {username},
			// 			attributes: ['id', 'username', 'email'],
			// 		});
					
			// 		if (existingUser && username.length >= 16)
			// 			throw new Error('Username exists')
			// 		if (existingUser && username.length < 16)
			// 			username += '0';
			// 	} while (existingUser);
			// } catch (error) {
			// 	throw new ApiError(422, 'Username is already taken');
			// }

			const user = await models.user.create({
				username,
				email: response.data.email,
				bio: response.data.bio,
				activated: true,
				password: null,
			});

			await models.socialConnection.create({
				user_id: user.id,
				service_id: response.data.id,
				service: 'github',
				token_type: token.token_type,
				token: token.access_token,
			});

			ctx.body = {
				username: user.username,
				expires_in: 84600 * 90,
				token_type: 'Bearer',
				token: jwt.sign({
					id: user.id,
					priv: cryptojs.SHA256(user).toString(),
				}, config.jwt.secret, {expiresIn: '90d'}),
			};
		}

		return next();
	},
};
