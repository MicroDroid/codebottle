const logger = require('./utils/logger');
const config = require('./config');
const bluebird = require('bluebird');
const redis = require('redis');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
	host: config.redis.host,
	port: config.redis.port,
});

/* istanbul ignore next */
client.on('error', e => {
	logger.err(`Redis error: ${e.toString()}`);
});

/* istanbul ignore next */
if (config.redis.password)
	client.auth(config.redis.password);

module.exports = client;