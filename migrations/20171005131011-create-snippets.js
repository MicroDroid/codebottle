'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('snippets', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			public_id: {
				type: Sequelize.STRING(10),
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
				type: Sequelize.STRING(70),
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
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 0
			},
			deleted_at: {
				type: TIMESTAMP,
				defaultValue: null,
				allowNull: true,
			},
			created_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
			updated_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
		}).then(async () => {
			await queryInterface.addIndex('snippets', ['category_id']);
			await queryInterface.addIndex('snippets', ['language_id']);
			await queryInterface.addIndex('snippets', ['user_id']);
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('snippets');
	}
};