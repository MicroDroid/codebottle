

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const logger = require('../utils/logger');

const basename = path.basename(__filename);

const config = require('../config');
const db = {};

let sequelize = null;

if (config.sequelize.use_env_variable) {
	sequelize = new Sequelize(process.env[config.sequelize.use_env_variable]);
} else {
	sequelize = new Sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, {
		...config.sequelize,
		logging: config.logging.sql ? logger.sql : () => {},
	});
}

fs.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		var model = sequelize['import'](path.join(__dirname, file));
		db[model.name] = model;
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
