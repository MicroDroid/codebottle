'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const emailVerification = sequelize.define('emailVerification', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER.UNSIGNED
		},
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			unique: true
		},
		token: {
			type: DataTypes.STRING(191),
			allowNull: false,
			unique: true
		},
		email: {
			type: DataTypes.STRING(191),
			allowNull: true
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

	emailVerification.transform = verification => ({
		user_id: verification.user_id,
		token: verification.token,
		email: verification.email,
		created_at: verification.created_at,
		updated_at: verification.updated_at,
	});

	emailVerification.associate = models => {
		emailVerification.belongsTo(models.user);
	};

	return emailVerification;
};