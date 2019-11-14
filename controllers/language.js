const models = require('../models');
const ApiError = require('../errors/api-error');

module.exports = {
	async getAll(ctx) {
		const languages = await models.language.findAll({
			attributes: ['id', 'name'],
		});

		if (!languages || languages.length < 1)
			throw new ApiError(404, 'Not found');

		ctx.body = languages.map(models.language.transform);
	},

	async get(ctx) {
		const language = await models.language.findOne({
			where: { id: ctx.params.id },
			attributes: ['id', 'name'],
		});

		if (!language)
			throw new ApiError(404, 'Not found');

		ctx.body = models.language.transform(language);
	},

	async create(ctx) {
		const name = ctx.request.body.name;

		if (!name)
			throw new ApiError(422, 'No name provided');

		const existing = await models.language.findOne({
			where: { name },
		});

		if (existing)
			throw new ApiError(422, 'Language already exists');

		const { id } = await models.language.create({
			name,
		});

		ctx.body = models.language.transform(await models.language.findOne({
			where: { id },
		}));
	},

	async delete(ctx) {
		const language = await models.language.findOne({
			where: { id: ctx.params.id },
			include: [ models.snippet ],
		});

		if (language.snippets.length > 0)
			throw new ApiError(409, 'Cannot delete language with existing snippets');

		if (!language)
			throw new ApiError(404, 'Not found');

		language.destroy();

		ctx.status = 204;
	},
};
