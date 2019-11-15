'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('snippet_tags', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			snippet_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
			},
			tag_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
			},
			created_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false,
			},
			updated_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false,
			},
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('snippet-tags');
	},
};