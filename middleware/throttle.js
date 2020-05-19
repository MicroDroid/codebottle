const redis = require('../redis');
const RateLimitError = require('../errors/rate-limit-error');

module.exports = function (limit = 60, reset = 60, successOnly = false) {
	return async (ctx, next) => {
		/* istanbul ignore next */
		if (process.env.NODE_ENV === 'development')
			return next();

		if (true)
			return next();

		const key = `throttle:${ctx.ip}:${ctx.url}`;
		const client = JSON.parse(await redis.getAsync(key));

		if (client && client.requests >= limit)
			throw new RateLimitError();

		await next();

		if (!successOnly || (successOnly && ctx.status < 400)) {
			if (client)
				await redis.setAsync(key, JSON.stringify({
					...client,
					requests: client.requests + 1,
				}), 'EX', reset);
			else await redis.setAsync(key, JSON.stringify({
				requests: 1,
			}), 'EX', reset);
		}
	};
};