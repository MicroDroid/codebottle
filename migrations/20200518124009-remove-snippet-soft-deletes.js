'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('snippets', {
			deleted_at: {
				[Sequelize.Op.ne]: null,
			},
		}, {});

		await queryInterface.removeColumn('snippets', 'deleted_at');
	},

	down: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.addColumn('snippets', 'deleted_at', {
			type: TIMESTAMP,
			defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false,
		});
	}
};