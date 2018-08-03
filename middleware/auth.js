const ApiError = require('../errors/api-error');
const models = require('../models');
const cryptojs = require('crypto-js');
const _ = require('lodash');

module.exports = (passthrough = false) => async (ctx, next) => {
	const error = new ApiError(401, 'Authentication token expired');
	if (ctx.state.user) {
		const user = await models.user.findOne({
			where: {id: ctx.state.user.id},
		});

		if (!user)
			if (passthrough)
				ctx.state.user = undefined;
			else
				throw error;

		const priv = cryptojs.SHA256(_.pick(user, ['id', 'username', 'email', 'password', 'banned', 'activated'])).toString();

		if (user && priv === ctx.state.user.priv)
			ctx.state.user = user;
		else if (passthrough) {
			ctx.state.user = undefined;
			return next();
		} else throw error;
	} else if (!passthrough)
		throw error;

	return next();
};
