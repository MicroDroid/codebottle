'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const socialConnection = sequelize.define('socialConnection', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		service_id: {
			type: DataTypes.STRING(191),
			allowNull: true
		},
		service: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		token: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		token_type: {
			type: DataTypes.STRING(191),
			allowNull: false
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
	});

	socialConnection.associate = models => {
		socialConnection.belongsTo(models.user);
	};

	return socialConnection;
};