'use strict';
module.exports = (sequelize, DataTypes) => {
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
			type: DataTypes.STRING,
			allowNull: false
		},
		deleted_at: {
			type: DataTypes.TIME,
			allowNull: true,
		},
		created_at: {
			type: DataTypes.TIME,
			allowNull: false
		},
		updated_at: {
			type: DataTypes.TIME,
			allowNull: false
		}
	}, {
		paranoid: true,
	});

	flag.associate = models => {
		// TODO
	};

	return flag;
};