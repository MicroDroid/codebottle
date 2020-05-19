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

	socialConnection.transform = connection => ({
		user_id: connection.user_id,
		service_id: connection.service_id,
		service: connection.service,
		token: connection.token,
		token_type: connection.token_type,
		created_at: connection.created_at,
		updated_at: connection.updated_at,
	});

	socialConnection.associate = models => {
		socialConnection.belongsTo(models.user);
	};

	return socialConnection;
};