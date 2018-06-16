const models = require('../models');
const ApiError = require('../errors/api-error');

const controller = {
	getAll: async (ctx, next) => {
		// Not querying snippet revs directly because snippet might be soft-deleted
		const snippet = await models.snippet.findOne({
			where: {
				'public_id': ctx.params.snippet_id
			},
			include: [
				{
					model: models.snippetRevision,
					include: [models.language, models.category, models.user],
				}
			],
			order: [
				[models.snippetRevision, 'created_at', 'ASC']
			]
		});

		if (!snippet)
			throw new ApiError(404, 'Not found');
			
		ctx.body = snippet.snippetRevisions.map(models.snippetRevision.transform);

		return next();
	},

	get: async (ctx, next) => {
		// Not querying snippet revs directly because snippet might be soft-deleted
		const snippet = await models.snippet.findOne({
			where: {
				'public_id': ctx.params.snippet_id
			},
			include: [{
				model: models.snippetRevision,
				include: [models.language, models.category, models.user],
			}],
			order: [
				[models.snippetRevision, 'created_at', 'ASC']
			]
		});

		const revision = snippet.snippetRevisions[ctx.params.id-1];

		if (!snippet || !revision)
			throw new ApiError(404, 'Not found');

		ctx.body = models.snippetRevision.transform(revision);

		return next();
	}
};

module.exports = controller;