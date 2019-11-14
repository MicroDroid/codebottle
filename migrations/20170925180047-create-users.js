'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER.UNSIGNED
			},
			username: {
				type: Sequelize.STRING(191),
				allowNull: false,
				unique: true
			},
			email: {
				type: Sequelize.STRING(191),
				allowNull: false,
				unique: true
			},
			password: {
				type: Sequelize.STRING(191),
				allowNull: true,
			},
			bio: {
				type: Sequelize.STRING(191),
				allowNull: true,
			},
			banned: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			activated: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			deleted_at: {
				type: TIMESTAMP,
				defaultValue: null,
				allowNull: true,
			},
			created_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
			updated_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('users');
	}
};