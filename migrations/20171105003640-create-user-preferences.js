'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('user_preferences', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			user_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				unique: true
			},
			private_email: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			indentation_size: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 4
			},
			convert_tabs_to_spaces: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false
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
		return queryInterface.dropTable('user_preferences');
	}
};