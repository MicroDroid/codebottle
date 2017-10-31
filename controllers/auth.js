const config = require('../config');
const models = require('../models');
const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js');
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
};
