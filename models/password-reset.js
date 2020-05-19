'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const passwordReset = sequelize.define('passwordReset', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		token: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		created_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		},
	}, {
		updatedAt: false,
	});

	passwordReset.transform = reset => ({
		email: reset.email,
		token: reset.token,
		created_at: reset.created_at,
	});

	passwordReset.associate = models => {
		passwordReset.belongsTo(models.user, {
			foreignKey: 'email',
			targetKey: 'email'
		});
	};

	return passwordReset;
};