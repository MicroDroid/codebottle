'use strict';
module.exports = (sequelize, DataTypes) => {
	const passwordReset = sequelize.define('passwordReset', {
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
			allowNull: false
		},
	}, {
		updatedAt: false,
	});

	passwordReset.associate = models => {
		passwordReset.belongsTo(models.user, {foreignKey: 'email', targetKey: 'email'});
	};

	return passwordReset;
};
