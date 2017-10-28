'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('snippets', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			public_id: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true
			},
			user_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			category_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			language_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			title: {
				type: Sequelize.STRING(160),
				allowNull: false
			},
			code: {
				type: Sequelize.TEXT,
				allowNull: false
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true
			},
			views: {
				type: Sequelize.UNSIGNED,
				allowNull: false,
				defaultValue: 0
			},
			deleted_at: {
				type: Sequelize.TIME,
				allowNull: true
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
		return queryInterface.dropTable('snippets');
	}
};