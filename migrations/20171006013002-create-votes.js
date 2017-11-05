'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('votes', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER.UNSIGNED
			},
			user_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			snippet_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			vote: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.TIME
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.TIME
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('votes');
	}
};