'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('password_resets', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			email: {
				type: Sequelize.STRING(191),
				allowNull: false,
			},
			token: {
				type: Sequelize.STRING(191),
				allowNull: false,
			},
			created_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
		}, {
			updatedAt: false,
		}).then(async () => {
			await queryInterface.addIndex('password_resets', ['email']);
			await queryInterface.addIndex('password_resets', ['token']);			
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('password_resets');
	}
};