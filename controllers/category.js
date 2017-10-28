const models = require('../models');
const ApiError = require('../errors/api-error');

module.exports = {
	getAll: async (ctx, next) => {
		const categories = await models.category.findAll({
			attributes: ['id', 'name'],
		});
		
		if (!categories || categories.length < 1)
			throw new ApiError(404, 'Not found');

		ctx.body = categories.map(models.category.transform);

		return next();
	},

	get: async (ctx, next) => {
		const category = await models.category.findOne({
			where: {id: ctx.params.id},
			attributes: ['id', 'name'],
		});
		
		if (!category)
			throw new ApiError(404, 'Not found');

		ctx.body = models.category.transform(category);

		return next();
	},
};
