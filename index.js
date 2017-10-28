require('dotenv').config();

const logger = require('./utils/logger');
const api = require('./api');
const assets = require('./assets');

const apiPort = process.env.API_PORT || 3000;
const serverPort = process.env.SERVER_PORT || 3001;

api.listen(apiPort);
logger.info(`API listening on port ${apiPort}`);

assets.listen(serverPort);
logger.info(`Assets server listening on port ${serverPort}`);
