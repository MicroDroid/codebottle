const config = require('../config');
const redis = require('../redis');
const nodemailer = require('../nodemailer');
const helpers = require('../helpers');

const models = require('../models');
const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js');
const crypto = require('crypto');

const bcrypt = require('bcrypt');
const ApiError = require('../errors/api-error');

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
			attributes: ['id', 'email', 'token'],
		});

		if (!reset)
			throw new ApiError(422, 'Invalid token');

		const user = await reset.getUser();
		user.password = await bcrypt.hash(ctx.request.body.password, config.bcrypt.saltRounds);
		user.save();

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
	}
};
