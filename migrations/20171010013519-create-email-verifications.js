'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('email_verifications', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER.UNSIGNED
			},
			user_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				unique: true
			},
			token: {
				type: Sequelize.STRING(191),
				allowNull: false,
				unique: true
			},
			email: {
				type: Sequelize.STRING(191),
				allowNull: true
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
		return queryInterface.dropTable('email_verifications');
	}
};