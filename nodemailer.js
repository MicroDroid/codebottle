const config = require('./config');
const logger = require('./utils/logger');

const nodemailer = require('nodemailer');
const stubTransport = require('nodemailer-stub-transport');
const mailgun = require('nodemailer-mailgun-transport');

let transport = null;

/* istanbul ignore next */
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing') {
	logger.warn(`Detected ${process.env.NODE_ENV} environment, mocking mailing`);
	transport = nodemailer.createTransport(stubTransport());
} else {
	if (!config.mailgun || !config.mailgun.apiKey || !config.mailgun.domain)
		logger.warn('Mailgun credentials not set, mailing will fail');
	
	transport = nodemailer.createTransport(mailgun({
		auth: {
			api_key: config.mailgun.apiKey,
			domain: config.mailgun.domain,
		}
	}));
}

module.exports = transport;
