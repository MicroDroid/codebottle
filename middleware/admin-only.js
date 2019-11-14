const ApiError = require('../errors/api-error');

module.exports = async (ctx, next) => {
	if (!ctx.state.user || !ctx.state.user.admin)
		throw new ApiError(403, 'Access denied');

	return next();
};
