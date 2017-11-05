const models = require('../models');
const ApiError = require('../errors/api-error');

module.exports = {
	get: async (ctx, next) => {
		ctx.body = models.userPreferences.transform(await ctx.state.user.getUserPreferences());

		return next();
	},

	set: async (ctx, next) => {
		const privateEmail = ctx.request.body.private_email;
		const convertTabsToSpaces = ctx.request.body.convert_tabs_to_spaces;
		const indentationSize = ctx.request.body.indentation_size;

		if (typeof(privateEmail) === 'undefined')
			throw new ApiError(422, 'Private email state is missing');
		else if (typeof(convertTabsToSpaces) === 'undefined')
			throw new ApiError(422, 'Convert tabs to spaces state is missing');
		else if (typeof(indentationSize) === 'undefined')
			throw new ApiError(422, 'Indentation size is missing');
		else if (isNaN(indentationSize))
			throw new ApiError(422, 'Invalid indentation size');
		else if (indentationSize > 8 || indentationSize < 2)
			throw new ApiError(422, 'Indentation size must be between 2 and 8');

		const prefs = ctx.state.user.getUserPreferences();
		prefs.private_email = !!privateEmail;
		prefs.convert_tabs_to_spaces = !!convertTabsToSpaces;
		prefs.indentation_size = indentationSize;
		await prefs.save();

		ctx.status = 204;

		return next();
	}
};
