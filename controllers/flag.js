const redis = require('../redis');
const models = require('../models');
const ApiError = require('../errors/api-error');

module.exports = {
	flagSnippet: async (ctx, next) => {
		const description = ctx.request.body.description;

		const user = ctx.state.user;
		const snippet = await models.snippet.findOne({
			where: {public_id: ctx.params.id}
		});

		if (!description)
			throw new ApiError(422, 'No description provided');
		else if (!snippet)
			throw new ApiError(404, 'Not found');
		else if (snippet.user_id === user.id)
			throw new ApiError(403, 'You can\'t flag your own snippet');

		const cacheKey = `snippets:${snippet.id}:flag.throttle:${user.id}`;

		if (!(await redis.getAsync(cacheKey))) {
			await models.flag.create({
				user_id: user.id,
				description,
				flaggable_id: snippet.id, // Blame Sequelize (or its doc), not me
				flaggable_type: 'snippet',
			});

			await redis.setAsync(cacheKey, 1, 'EX', 3600 * 24);
		} else throw new ApiError(429, 'You have already flagged this snippet recently');

		ctx.status = 204;

		return next();
	},

	flagUser: async (ctx, next) => {
		const description = ctx.request.body.description;

		const user = ctx.state.user;
		const flaggedUser = await models.user.findOne({
			where: {username: ctx.params.username}
		});

		if (!description)
			throw new ApiError(422, 'No description provided');
		else if (!flaggedUser)
			throw new ApiError(404, 'Not found');
		else if (flaggedUser.id === user.id)
			throw new ApiError(403, 'You can\'t flag yourself');

		const cacheKey = `users:${flaggedUser.id}:flag.throttle:${user.id}`;

		if (!(await redis.getAsync(cacheKey))) {
			await models.flag.create({
				user_id: user.id,
				description,
				flaggable_id: flaggedUser.id, // Blame Sequelize (or its doc), not me
				flaggable_type: 'user',
			});

			await redis.setAsync(cacheKey, 1, 'EX', 3600 * 24);
		} else throw new ApiError(429, 'You have already flagged this user recently');

		ctx.status = 204;

		return next();
	}
};
