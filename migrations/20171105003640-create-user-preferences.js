'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
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
				type: Sequelize.TIME,
				allowNull: false
			},
			updated_at: {
				type: Sequelize.TIME,
				allowNull: false
			},
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_preferences');
	}
};