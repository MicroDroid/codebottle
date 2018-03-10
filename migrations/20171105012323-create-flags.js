'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('flags', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			user_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: false
			},
			flaggable_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			flaggable_type: {
				type: Sequelize.STRING(191),
				allowNull: false
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
		return queryInterface.dropTable('flags');
	}
};