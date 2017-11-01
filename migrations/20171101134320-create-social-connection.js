'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('socialConnections', {
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
			service_id: {
				type: Sequelize.STRING,
				allowNull: true
			},
			service: {
				type: Sequelize.STRING,
				allowNull: false
			},
			token: {
				type: Sequelize.STRING,
				allowNull: false
			},
			token_type: {
				type: Sequelize.STRING,
				allowNull: false
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
		return queryInterface.dropTable('socialConnections');
	}
};