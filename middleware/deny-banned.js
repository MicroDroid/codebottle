const ApiError = require('../errors/api-error');

module.exports = async (ctx, next) => {
	if (ctx.state.user && ctx.state.user.banned)
		throw new ApiError(403, 'You have been banned');

	return next();
};
