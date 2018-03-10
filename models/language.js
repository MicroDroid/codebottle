'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const language = sequelize.define('language', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(16),
			allowNull: false,
		},
		created_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		},
		updated_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		},
	}, {});

	language.associate = models => {
		language.hasMany(models.snippet);
	};

	language.transform = language => ({
		id: language.id,
		name: language.name,
	});

	return language;
};
