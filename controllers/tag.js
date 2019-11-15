const models = require('../models');
const ApiError = require('../errors/api-error');

const controller = {
	async getAll(ctx, next) {
		const tags = await models.tag.findAll();

		ctx.body = tags.map(models.tag.transform);
	},

	async get(ctx, next) {
		const tag = await models.tag.findOne({
			where: {
				id: ctx.params.id,
			},
		});

		if (!tag)
			throw new ApiError(404, 'Not found');

		ctx.body = models.tag.transform(tag);
	},

	async create(ctx) {
		const name = ctx.request.body.name;

		if (!name)
			throw new ApiError(422, 'No name provided');

		const existing = await models.tag.findOne({
			where: { name },
		});

		if (existing)
			throw new ApiError(422, 'Tag already exists');

		const { id } = await models.tag.create({
			name,
		});

		ctx.body = models.tag.transform(await models.tag.findOne({
			where: { id },
		}));
	},

	async delete(ctx) {
		const tag = await models.tag.findOne({
			where: { id: ctx.params.id },
			include: [ models.snippet ],
		});

		if (tag.snippets.length > 0)
			throw new ApiError(409, 'Cannot delete tag with existing snippets');

		if (!tag)
			throw new ApiError(404, 'Not found');

		tag.destroy();

		ctx.status = 204;
	},

	async getSnippets(ctx, next) {
		const tag = await models.tag.findOne({
			where: {
				id: ctx.params.id,
			},

			include: [
				{
					model: models.snippet,
					include: [
						models.language,
						models.category,
						models.vote,
						models.user,
						models.tag,
					],
				},
			],
		});

		if (!tag)
			throw new ApiError(404, 'Not found');

		ctx.body = tag.snippets.map(models.snippet.transform);
	},
};

module.exports = controller;