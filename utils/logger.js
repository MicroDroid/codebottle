const colors = require('colors/safe');
const stackTrace = require('stack-trace');
const path = require('path');
const config = require('../config');
const DiscordWebhook = require('webhook-discord');
const os = require('os');

const hook = config.hooks.discord.log ? new DiscordWebhook(config.hooks.discord.log) : null;

/* istanbul ignore next */
function log(type, message) {
	if (!config.logging)
		return;

	var generated = (new Date()).toISOString() + ' ';

	switch(type) {
	case 'info':
		generated += colors.black.bgBlue(' INFO ') + ' ' + colors.white(message);
		break;
	case 'err':
		generated += colors.black.bgRed(' ERR  ') + ' ' + colors.yellow(message);
		break;
	case 'warn':
		generated += colors.black.bgYellow(' WARN ') + ' ' + colors.red(message);
		break;
	case 'recv':
		generated += colors.black.bgGreen(' RECV ') + ' ' + colors.white(message);
		break;
	case 'sql':
		generated += colors.black.bgBlue(' SQL  ') + ' ' + colors.white(message);
		break;
	default:
		generated += colors.black.bgBlue(' INFO ') + ' ' + colors.white(message);
		break;
	}

	const trace = stackTrace.get();
	const root = path.dirname(__dirname);
	const caller = `.${trace[2].getFileName().substring(root.length)}:${trace[2].getLineNumber()}`;

	generated += ' ' + colors.italic(colors.grey(caller));

	console.log(generated);

	if (hook)
		if (type === 'warn')
			hook.custom('CodeBottle', message, os.hostname(), '#ffe900');
		else if (type === 'err')
			hook.custom('CodeBottle', message, os.hostname(), '#ff0000');
}

/* istanbul ignore next */
module.exports = {
	info: (m) => log('info', m),
	err: (m) => log('err', m),
	warn: (m) => log('warn', m),
	recv: (m) => log('recv', m),
	sql: (m) => log('sql', m),
};
