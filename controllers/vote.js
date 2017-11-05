const models = require('../models');
const ApiError = require('../errors/api-error');

const controller = {
	vote: async (ctx, next) => {
		const vote = ctx.request.body.vote;

		if (isNaN(vote))
			throw new ApiError(422, 'Invalid vote');

		const snippet = await models.snippet.findOne({
			where: {public_id: ctx.params.snippet},
			attributes: ['id', 'public_id', 'user_id'],
		});

		if (!snippet)
			throw new ApiError(404, 'Not found');
		else if (snippet.user_id === ctx.state.user.id)
			throw new ApiError(403, 'You can\'t vote to your snippet');

		await models.vote.upsert({
			snippet_id: snippet.id,
			user_id: ctx.state.user.id,
			vote: vote > 0 ? 1 : (vote < 0 ? -1 : 0),
		});

		ctx.status = 204;

		return next();
	}
};

module.exports = controller;