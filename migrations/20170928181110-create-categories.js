'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('categories', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.STRING(16),
				allowNull: false,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.TIME
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.TIME
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('categories');
	}
};