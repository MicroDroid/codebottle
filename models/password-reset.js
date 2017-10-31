'use strict';
module.exports = (sequelize, DataTypes) => {
	var passwordReset = sequelize.define('passwordReset', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		created_at: {
			type: DataTypes.TIME,
			allowNull: true
		},
	}, {
		updatedAt: false,
	});

	passwordReset.associate = models => {
		passwordReset.belongsTo(models.user, {foreignKey: 'email'});
	};

	return passwordReset;
};
