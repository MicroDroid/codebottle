const logger = require('../utils/logger');

// This is a handler for non-codebottle errors, like connection drops etc.
module.exports = async (error, ctx) => {
	if (error.code === 'EPIPE') {
		logger.warn(`EPIPE: ${ctx.path}`);
	} else if (error.code === 'ERR_STREAM_DESTROYED') {
		logger.warn(`ERR_STREAM_DESTROYED: ${ctx.path}`);
	} else {
		logger.err(`Error handling: ${ctx.path}`);
		logger.err(error.stack);
	}
};
