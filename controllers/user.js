const config = require('../config');

const helpers = require('../helpers');
const Sequelize = require('sequelize');
const models = require('../models');
const ApiError = require('../errors/api-error');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('../nodemailer');
const cryptojs = require('crypto-js');

module.exports = {
	get: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {username: ctx.params.username},
			attributes: ['username', 'email', 'bio', 'banned', 'created_at'],
		});

		if (!user)
			throw new ApiError(404, 'Not found');
		
		ctx.body = models.user.transform(user, true);

		return next();
	},

	create: async (ctx, next) => {
		// See: https://stackoverflow.com/a/1373724/2164304
		const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
		const usernameRegex = /^[0-9A-Za-z]{3,16}$/;

		if (!(await helpers.verifyRecaptcha(ctx.request.body.recaptcha_token)))
			throw new ApiError(422, 'Invalid reCAPTCHA');

		if (!ctx.request.body.username)
			throw new ApiError(422, 'Missing username');
		if (ctx.request.body.username.length < 2)
			throw new ApiError(422, 'Username.length < 2');
		if (ctx.request.body.username.length > 16)
			throw new ApiError(422, 'Username.length > 16');
		if (!ctx.request.body.username.match(usernameRegex))
			throw new ApiError(422, 'Username must be alpha-numeric');

		if (!ctx.request.body.email)
			throw new ApiError(422, 'Email is missing');
		if (!ctx.request.body.email.match(emailRegex)) // At least they put some effort
			throw new ApiError(422, 'Invalid email');
		
		if (!ctx.request.body.password)
			throw new ApiError(422, 'Missing password');
		if (ctx.request.body.password.length < 6)
			throw new ApiError(422, 'Password should be at least 6 characters');

		const existingUser = await models.user.findOne({
			where: {
				[Sequelize.Op.or]: [
					{username: ctx.request.body.username},
					{email: ctx.request.body.email},
				]
			}
		});

		if (existingUser) {
			if (existingUser.username === ctx.request.body.username)
				throw new ApiError(422, 'Username is in use');
			else
				throw new ApiError(422, 'Email is in use');
		}

		const user = await models.user.create({
			username: ctx.request.body.username,
			email: ctx.request.body.email,
			password: await bcrypt.hash(ctx.request.body.password, config.bcrypt.saltRounds),
		});

		const token = crypto.randomBytes(16).toString('hex');

		await models.emailVerification.create({
			user_id: user.id,
			token: cryptojs.SHA256(token).toString(),
		});

		nodemailer.sendMail({
			from: '"CodeBottle" <noreply@codebottle.io>',
			to: user.email,
			subject: 'Verify your email',
			text: `Hi,

Please click the link below to verify your email:

https://codebottle.io/verify-email#${token}

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
					Please click the link below to verify your email:
				</p>
				<a href="https://codebottle.io/verify-email#${token}">
					https://codebottle.io/verify-email#${token}
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

		ctx.status = 204;

		return next();
	},

	verifyEmail: async (ctx, next) => {
		if (!ctx.request.body.token)
			throw new ApiError(422, 'Token is missing');

		const verification = await models.emailVerification.findOne({
			where: {token: cryptojs.SHA256(ctx.request.body.token).toString()},
		});

		if (!verification)
			throw new ApiError(422, 'Invalid token');

		const user = verification.getUser();
		if (verification.email)
			user.email = verification.email;
		user.activated = true;
		user.save();

		verification.destroy();

		ctx.status = 204;
		return next();
	},


	getSelf: async (ctx, next) => {
		ctx.body = models.user.transform(ctx.state.user, false);

		const githubConnection = await models.socialConnection.findAll({
			where: {
				user_id: ctx.state.user.id,
				service: 'github',
			}
		});

		return next();
	},
};
