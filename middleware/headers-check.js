const ApiError = require('../errors/api-error');

module.exports = async (ctx, next) => {
	const error = new ApiError(400, 'Invalid accept header');

	const regex = /application\/vnd\.codebottle(\.v(\d))*\+json/;
	const match = regex.exec(ctx.get('Accept'));

	let version;

	if (!match)
		version = '1';
	else
		version = match[2];

	if (version !== '1')
		throw error;
	else await next();
};
