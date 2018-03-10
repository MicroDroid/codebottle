'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const category = sequelize.define('category', {
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

	category.associate = models => {
		category.hasMany(models.snippet);
	};

	category.transform = category => ({
		id: category.id,
		name: category.name,
	});
	
	return category;
};
