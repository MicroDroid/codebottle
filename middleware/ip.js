module.exports = async (ctx, next) => {
	ctx.ip = ctx.get('CF_CONNECTING_IP') || ctx.ip;
	return next();
};
