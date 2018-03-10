'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('social_connections', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			user_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			service_id: {
				type: Sequelize.STRING(191),
				allowNull: true
			},
			service: {
				type: Sequelize.STRING(191),
				allowNull: false
			},
			token: {
				type: Sequelize.STRING(191),
				allowNull: false
			},
			token_type: {
				type: Sequelize.STRING(191),
				allowNull: false
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
			await queryInterface.addIndex('social_connections', ['user_id', 'service'], {unique: true});
			await queryInterface.addIndex('social_connections', ['user_id', 'service', 'service_id'], {unique: true});		
			await queryInterface.addIndex('social_connections', ['user_id']);
			await queryInterface.addIndex('social_connections', ['service_id']);
			await queryInterface.addIndex('social_connections', ['service']);
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('social_connections');
	}
};