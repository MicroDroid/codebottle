const logger = require('../utils/logger');
const colors = require('colors');

module.exports = type => async (ctx, next) => {
	let tabs = '\t';

	if (ctx.ip.toString().length < 8)
		tabs += '\t';

	const origin = type === 'api' ? colors.black.bgYellow(' API ') : colors.black.bgCyan(' RES ');

	logger.recv(`${origin} ${ctx.ip} ${tabs} → ${ctx.url}`);

	return next();
};
