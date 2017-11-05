const config = require('../config');

const redis = require('../redis');
const helpers = require('../helpers');
const Sequelize = require('sequelize');
const models = require('../models');
const ApiError = require('../errors/api-error');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('../nodemailer');
const cryptojs = require('crypto-js');

const validateUsername = username => {
	const usernameRegex = /^[0-9A-Za-z]{3,16}$/;

	if (!username)
		throw new ApiError(422, 'Missing username');
	if (username.length < 2)
		throw new ApiError(422, 'Username.length < 2');
	if (username.length > 16)
		throw new ApiError(422, 'Username.length > 16');
	if (!username.match(usernameRegex))
		throw new ApiError(422, 'Username must be alpha-numeric');
};

const validateEmail = email => {
	// See: https://stackoverflow.com/a/1373724/2164304
	const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

	if (!email)
		throw new ApiError(422, 'Email is missing');
	else if (!email.match(emailRegex)) // At least they put some effort
		throw new ApiError(422, 'Invalid email');
};

module.exports = {
	get: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {username: ctx.params.username},
			attributes: ['username', 'email', 'bio', 'banned', 'created_at'],
		});

		if (!user)
			throw new ApiError(404, 'Not found');
		
		ctx.body = models.user.transform(user, true, await helpers.getGitHubUsername(user.id));

		// No idea why I have to ignore this
		/* istanbul ignore next */
		return next();
	},

	create: async (ctx, next) => {
		if (!(await helpers.verifyRecaptcha(ctx.request.body.recaptcha_token)))
			throw new ApiError(422, 'Invalid reCAPTCHA');

		validateUsername(ctx.request.body.username);
		validateEmail(ctx.request.body.email);
		
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

		await models.userPreferences.create({
			user_id: user.id,
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

		const user = await verification.getUser();
		if (verification.email)
			user.email = verification.email;
		user.activated = true;
		user.save();

		verification.destroy();

		ctx.status = 204;
		return next();
	},


	getSelf: async (ctx, next) => {
		ctx.body = models.user.transform(ctx.state.user, false, await helpers.getGitHubUsername(ctx.state.user.id));

		return next();
	},

	setSelf: async (ctx, next) => {
		const username = ctx.request.body.username;
		const email = ctx.request.body.email;
		const bio = ctx.request.body.bio;

		const user = ctx.state.user;

		validateUsername(username);
		validateEmail(email);

		const existingUser = await models.user.findOne({
			where: {
				[Sequelize.Op.or]: [
					{username: ctx.request.body.username},
					{email: ctx.request.body.email},
				]
			}
		});

		if (existingUser && existingUser.id !== user.id) {
			if (existingUser.username === username)
				throw new ApiError(422, 'Username is in use');
			else
				throw new ApiError(422, 'Email is in use');
		}

		if (ctx.state.user.email !== email) {
			const cacheKey = `users:${user.id}:email.change`;

			if (!(await redis.getAsync(cacheKey))) {
				const token = crypto.randomBytes(16).toString('hex');

				await models.emailVerification.upsert({
					email,
					user_id: user.id,
					token: cryptojs.SHA256(token).toString(),
				});

				nodemailer.sendMail({
					from: '"CodeBottle" <noreply@codebottle.io>',
					to: user.email,
					subject: 'Verify your new email',
					text: `Hi,

It looks like you have requested changing your email address. Please click the link below to verify the change:

https://codebottle.io/verify-email#${token}

You can safely ignore this email if it was by mistake, and you can also contact us about it.

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
								It looks like you have requested changing your email address. Please click the link below to verify the change:
							</p>
							<a href="https://codebottle.io/verify-email#${token}">
								https://codebottle.io/verify-email#${token}
							</a>
							<p>
								You can safely ignore this email if it was by mistake, and you can also contact us about it.
							</p>
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

				await redis.setAsync(cacheKey, 1, 'EX', 3600 * 24);
			} else throw new ApiError(429, 'You can only change your email once per 24 hours');
		}

		user.username = username;
		user.bio = bio;
		await user.save();

		ctx.status = 204;

		return next();
	}
};
