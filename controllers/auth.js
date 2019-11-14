const config = require('../config');
const redis = require('../redis');
const nodemailer = require('../nodemailer');
const helpers = require('../helpers');
const models = require('../models');
const ApiError = require('../errors/api-error');
const Sequelize = require('sequelize');

const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const simpleOAuth = require('simple-oauth2');
const _ = require('lodash');

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

		if (!user.activated)
			throw new ApiError(401, 'Verify your email first');

		const priv = cryptojs.SHA256(JSON.stringify(_.pick(user, ['id', 'username', 'email', 'password', 'banned', 'activated']))).toString();

		ctx.body = {
			token: jwt.sign({
				id: user.id,
				priv,
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
					subject: 'Password reset request',
					text: `Hi,

You have requested a password reset for your account, please click the link below to proceed:

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
							You have requested a password reset for your account, please click the link below to proceed:
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

		const githubOAuth = simpleOAuth.create({
			client: {
				id: config.oauth.github.clientId,
				secret: config.oauth.github.clientSecret,
			},
			auth: {
				tokenHost: 'https://github.com',
				tokenPath: '/login/oauth/access_token',
				authorizePath: '/login/oauth/authorize',
			}
		});

		const token = await githubOAuth.authorizationCode.getToken({code})
			.catch(() => {
				throw new ApiError(422, 'Error retrieving GitHub data');
			});

		const githubUser = await helpers.getGitHubUser(token.access_token)
			.catch(() => {
				throw new ApiError(422, 'Error retrieving GitHub data');
			});

		if (!githubUser.email) {
			const email = (await helpers.getGitHubUserEmails(token.access_token)).find(email => email.primary);
			if (!email || !email.verified)
				throw new ApiError(422, 'Verify your email on GitHub first');
			githubUser.email = email.email;
		}

		let socialConnection = 	await models.socialConnection.findOne({
			where: {service: 'github',  service_id: githubUser.id},
			attributes: ['id', 'user_id', 'service', 'service_id', 'token', 'token_type'],
		});

		if (socialConnection) {
			const user = await socialConnection.getUser();
			socialConnection.token = token.access_token;
			await socialConnection.save();

			const priv = cryptojs.SHA256(JSON.stringify(_.pick(user, ['id', 'username', 'email', 'password', 'banned', 'activated']))).toString();

			ctx.body = {
				username: user.username,
				expiresIn: 84600 * 90,
				tokenType: 'Bearer',
				token: jwt.sign({
					id: user.id,
					priv,
				}, config.jwt.secret, {expiresIn: '90d'}),
			};
		} else {
			const usernameRegex = /[^0-9A-Za-z]/g;
			let username = githubUser.login.replace(usernameRegex, '')
				.substr(0,16)
				.padEnd(3, '0');

			let existingUser = await models.user.findOne({
				where: {
					[Sequelize.Op.or]: [
						{username},
						{email: githubUser.email},
					]
				},
				attributes: ['id', 'username', 'email', 'password', 'banned', 'activated'],
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
				email: githubUser.email,
				bio: githubUser.bio,
				activated: true,
				password: null,
			});

			await models.userPreferences.create({
				user_id: user.id,
			});

			await models.socialConnection.create({
				user_id: user.id,
				service_id: githubUser.id,
				service: 'github',
				token_type: token.token_type,
				token: token.access_token,
			});

			const priv = cryptojs.SHA256(JSON.stringify(_.pick(user, ['id', 'username', 'email', 'password', 'banned', 'activated']))).toString();

			ctx.body = {
				username,
				expiresIn: 84600 * 90,
				tokenType: 'Bearer',
				token: jwt.sign({
					id: user.id,
					priv,
				}, config.jwt.secret, {expiresIn: '90d'}),
			};
		}

		return next();
	},
};
