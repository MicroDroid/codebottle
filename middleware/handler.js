const ApiError = require('../errors/api-error');
const RateLimitError = require('../errors/rate-limit-error');
const logger = require('../utils/logger');

module.exports = async (ctx, next) => {
	try {
		await next();
		
		if (ctx.status === 404)
			ctx.body = {
				error: 'Not found',
			};
	} catch(e) {
		if (e instanceof ApiError || e instanceof RateLimitError) {
			ctx.status = e.status;
			ctx.body = {
				error: e.message
			};
		} else {
			if (e.status === 401) {
				ctx.status = 401;
				ctx.body = {
					error: 'Authentication required',
				};
			} else {
				ctx.status = 500;
				ctx.body = {
					error: 'Internal error'
				};
				
				console.log(e);
			}
		}
	}
};
