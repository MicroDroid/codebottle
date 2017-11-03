'use strict';
module.exports = (sequelize, DataTypes) => {
	const snippet = sequelize.define('snippet', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		public_id: {
			type: DataTypes.STRING(10),
			allowNull: false,
			unique: true
		},
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		category_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		language_id: {
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
		views: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			defaultValue: 0
		},
		deleted_at: {
			type: DataTypes.TIME,
			allowNull: true
		},
		createdAt: {
			type: DataTypes.TIME,
			allowNull: false,
			field: 'created_at',
		},
		updated_at: {
			type: DataTypes.TIME,
			allowNull: false
		}
	}, {
		paranoid: true,
	});

	snippet.associate = models => {
		snippet.belongsTo(models.language);
		snippet.belongsTo(models.category);
		snippet.hasMany(models.vote);
	};

	snippet.transform = (snippet, currentVote) => ({
		id: snippet.public_id,
		title: snippet.title,
		description: snippet.description,
		code: snippet.code,
		views: snippet.views,
		language: {
			id: snippet.language.id,
			name: snippet.language.name,
		},
		category: {
			id: snippet.category.id,
			name: snippet.category.name,
		},
		votes: snippet.votes.reduce((p, c) => p + c.vote, 0),
		createdAt: snippet.created_at,
		updatedAt: snippet.updated_at,
		...typeof(currentVote) !== 'undefined' && {currentVote},
	});

	return snippet;
};