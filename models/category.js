'use strict';
module.exports = (sequelize, DataTypes) => {
	const category = sequelize.define('category', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		updated_at: {
			type: DataTypes.TIME,
			allowNull: false,
		},
	}, {});

	category.associate = models => {
		category.hasMany(models.snippet);
	};

	category.transform = category => ({
		id: category.id,
		name: category.name,
	});
	
	return category;
};
