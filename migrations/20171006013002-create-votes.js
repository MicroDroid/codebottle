'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

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
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
			updated_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
		}).then(() => {
			queryInterface.addIndex('votes', ['user_id', 'snippet_id'], {unique: true})
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('votes');
	}
};