'use strict';
module.exports = (sequelize, DataTypes) => {
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
			type: DataTypes.STRING,
			allowNull: true
		},
		service: {
			type: DataTypes.STRING,
			allowNull: false
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		token_type: {
			type: DataTypes.STRING,
			allowNull: false
		},
		created_at: {
			type: DataTypes.TIME,
			allowNull: false
		},
		updated_at: {
			type: DataTypes.TIME,
			allowNull: false
		}
	});

	socialConnection.associate = models => {
		socialConnection.belongsTo(models.user);
	};

	return socialConnection;
};