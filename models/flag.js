'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const flag = sequelize.define('flag', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		flaggable_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		flaggable_type: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		created_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		},
		updated_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		},
	});

	flag.transform = flag => ({
		user_id: flag.user_id,
		description: flag.description,
		flaggable_type: flag.flaggable_type,
		flaggable_id: flag.flaggable_id,
		created_at: flag.created_at,
		updated_at: flag.updated_at,
	});

	flag.associate = models => {
		// TODO
	};

	return flag;
};