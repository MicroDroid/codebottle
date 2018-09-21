'use strict';

const logger = require('../utils/logger');

var fs				= require('fs');
var path			= require('path');
var Sequelize = require('sequelize');
var basename	= path.basename(__filename);

/* istanbul ignore next */
var env			 = process.env.NODE_ENV || 'development';
var config		= require(__dirname + '/../config')['sequelize'];
var db				= {};

var sequelize = null;
/* istanbul ignore next */
if (config.use_env_variable) {
	sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, {
		...config,
		logging: process.env.SQL_LOGGING !== 'false' ? logger.sql : () => {},
	});
}

/* istanbul ignore next */
fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		var model = sequelize['import'](path.join(__dirname, file));
		db[model.name] = model;
	});

/* istanbul ignore next */
Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
