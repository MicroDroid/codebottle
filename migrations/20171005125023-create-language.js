'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('languages', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false
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
		return queryInterface.dropTable('languages');
	}
};