'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('passwordResets', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false
			},
			token: {
				type: Sequelize.STRING,
				allowNull: false
			},
			created_at: {
				type: Sequelize.TIME,
				allowNull: true
			},
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('passwordResets');
	}
};