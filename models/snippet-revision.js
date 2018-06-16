'use strict';

module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const snippetRevision = sequelize.define('snippetRevision', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		snippet_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
		},
		user_id: { // This refers to who has made the edit 
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		title: {
			type: DataTypes.STRING(70),
			allowNull: false
		},
		code: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		category_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		language_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		explanation: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		created_at: { // This refers to revision creation, not snippet, obviously.
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		}
	}, {
		updatedAt: false,
	});

	snippetRevision.associate = models => {
		snippetRevision.belongsTo(models.user);
		snippetRevision.belongsTo(models.language);
		snippetRevision.belongsTo(models.category);
		snippetRevision.belongsTo(models.snippet);
	};

	snippetRevision.transform = (snippetRevision) => ({
		title: snippetRevision.title,
		description: snippetRevision.description,
		code: snippetRevision.code,
		language: {
			id: snippetRevision.language.id,
			name: snippetRevision.language.name,
		},
		category: {
			id: snippetRevision.category.id,
			name: snippetRevision.category.name,
		},
		author: snippetRevision.user.username,
		explanation: snippetRevision.explanation,
		createdAt: snippetRevision.created_at,
	});

	return snippetRevision;
};