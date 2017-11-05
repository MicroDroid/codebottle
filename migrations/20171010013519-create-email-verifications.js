'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('email_verifications', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER.UNSIGNED
			},
			user_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				unique: true
			},
			token: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true
			},
			email: {
				type: Sequelize.STRING,
				allowNull: true
			},
			created_at: {
				allowNull: false,
				type: Sequelize.TIME,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.TIME,
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('email_verifications');
	}
};