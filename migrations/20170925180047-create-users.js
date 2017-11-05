'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER.UNSIGNED
			},
			username: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true
			},
			password: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			bio: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			banned: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			activated: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.TIME
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.TIME
			},
			deleted_at: {
				allowNull: true,
				type: Sequelize.TIME
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('users');
	}
};