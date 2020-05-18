'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('flags', {
			deleted_at: {
				[Sequelize.Op.ne]: null,
			},
		}, {});

		await queryInterface.removeColumn('flags', 'deleted_at');
	},

	down: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.addColumn('flags', 'deleted_at', {
			type: TIMESTAMP,
			defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false,
		});
	}
};