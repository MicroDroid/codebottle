const logger = require('../utils/logger');
const colors = require('colors');

module.exports = async (ctx, next) => {
	let tabs = '\t';

	if (ctx.ip.toString().length < 8)
		tabs += '\t';

	const origin = ctx.origin.match(`https*://(api\.|(localhost|127.0.0.1|::1):${process.env.API_PORT}).*`)
		? colors.black.bgYellow(' API ')
		: colors.black.bgCyan(' RES ');

	logger.recv(`${origin} ${ctx.ip} ${tabs} → ${ctx.url}`);

	return next();
};
