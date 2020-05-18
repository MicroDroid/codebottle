'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('users', {
			deleted_at: {
				[Sequelize.Op.ne]: null,
			},
		}, {});

		await queryInterface.removeColumn('users', 'deleted_at');
	},

	down: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.addColumn('users', 'deleted_at', {
			type: TIMESTAMP,
			defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false,
		});
	}
};