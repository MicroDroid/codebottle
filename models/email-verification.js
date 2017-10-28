'use strict';
module.exports = (sequelize, DataTypes) => {
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
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true
		},
		created_at: {
			allowNull: false,
			type: DataTypes.TIME,
		},
		updated_at: {
			allowNull: false,
			type: DataTypes.TIME,
		},
	}, {});

	emailVerification.associate = models => {
		emailVerification.belongsTo(models.user);
	};

	return emailVerification;
};