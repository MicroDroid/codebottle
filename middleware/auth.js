const ApiError = require('../errors/api-error');
const models = require('../models');
const sha256 = require('crypto-js/sha256');

module.exports = (passthrough = false) => async (ctx, next) => {
	if (ctx.state.user) {
		const user = await models.user.findOne({
			where: {id: ctx.state.user.id},
			attributes: ['id', 'username', 'email', 'password', 'banned', 'activated'],
		});

		if (user && sha256(user).toString() === ctx.state.user.priv)
			ctx.state.user = user;
		else if (passthrough)
			return next();
		else throw new ApiError(401, 'Authentication token expired');
	}

	return next();
};
