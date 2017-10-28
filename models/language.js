'use strict';
module.exports = (sequelize, DataTypes) => {
	const language = sequelize.define('language', {
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

	language.associate = models => {
		language.hasMany(models.snippet);
	};

	language.transform = language => ({
		id: language.id,
		name: language.name,
	});

	return language;
};
