'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
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
				type: Sequelize.STRING,
				allowNull: false
			},
			deleted_at: {
				type: Sequelize.TIME,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.TIME,
				allowNull: false
			},
			updated_at: {
				type: Sequelize.TIME,
				allowNull: false
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('flags');
	}
};