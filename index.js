// dotenv is no longer used..
// For development, .env is loaded externally as env variables
// For production, those are provided by Docker
//
// require('dotenv').config();

const logger = require('./utils/logger');
const api = require('./api');
const assets = require('./assets');

const apiPort = process.env.API_PORT || 3000;
const assetsPort = process.env.ASSETS_PORT || 3001;

api.proxy = assets.proxy = true;

api.listen(apiPort);
logger.info(`API listening on port ${apiPort}`);

assets.listen(assetsPort);
logger.info(`Assets server listening on port ${assetsPort}`);
