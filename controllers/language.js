const models = require('../models');
const ApiError = require('../errors/api-error');

module.exports = {
	getAll: async (ctx, next) => {
		const languages = await models.language.findAll({
			attributes: ['id', 'name'],
		});
		
		if (!languages || languages.length < 1)
			throw new ApiError(404, 'Not found');

		ctx.body = languages.map(models.language.transform);

		return next();
	},

	get: async (ctx, next) => {
		const language = await models.language.findOne({
			where: {id: ctx.params.id},
			attributes: ['id', 'name'],
		});
		
		if (!language)
			throw new ApiError(404, 'Not found');

		ctx.body = models.language.transform(language);

		return next();
	},
};
