'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('snippet_revisions', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			snippet_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
			},
			user_id: { // This refers to who has made the edit 
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
			category_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			language_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			explanation: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			created_at: { // This refers to revision creation, not snippet, obviously.
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			}
		}, {
			updatedAt: false,
		}).then(async () => {
			await queryInterface.addIndex('snippet_revisions', ['snippet_id']);
			await queryInterface.addIndex('snippet_revisions', ['created_at']);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('snippet_revisions');
	}
};
