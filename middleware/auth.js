const ApiError = require('../errors/api-error');
const models = require('../models');
const cryptojs = require('crypto-js');
const _ = require('lodash');

module.exports = (passthrough = false) => async (ctx, next) => {
	if (ctx.state.user) {
		const user = await models.user.findOne({
			where: {id: ctx.state.user.id},
		});

		if (!user)
			if (passthrough)
				ctx.state.user = null;
			else throw new ApiError(401, 'Authentication token expired');

		const priv = cryptojs.SHA256(_.pick(user, ['id', 'username', 'email', 'password', 'banned', 'activated'])).toString();

		if (user && priv === ctx.state.user.priv)
			ctx.state.user = user;
		else if (passthrough) {
			ctx.state.user = null;
			return next();
		} else throw new ApiError(401, 'Authentication token expired');
	}

	return next();
};
