'use strict';

const Logger = require('../utils/logger');

module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

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
			type: TIMESTAMP,
			defaultValue: null,
			allowNull: true,
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
	}, {
		paranoid: true,
	});

	snippet.associate = models => {
		snippet.belongsTo(models.user);
		snippet.belongsTo(models.language);
		snippet.belongsTo(models.category);
		snippet.hasMany(models.vote);
		snippet.hasMany(models.flag, {
			foreignKey: 'flaggable_id',
			scope: {
				flaggable_type: 'snippet',
			}
		});
		snippet.hasMany(models.snippetRevision);
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
		...snippet.snippetRevisions && {revisions: snippet.snippetRevisions.length},
		...snippet.user && {username: snippet.user.username},
		...typeof(currentVote) !== 'undefined' && {currentVote},
		createdAt: snippet.created_at,
		updatedAt: snippet.updated_at,
	});

	snippet.afterCreate(snippet => {
		sequelize.models.snippetRevision.create({
			snippet_id: snippet.id,
			user_id: snippet.user_id, // Well for first revision it's same
			title: snippet.title,
			code: snippet.code,
			description: snippet.description,
			category_id: snippet.category_id,
			language_id: snippet.language_id,
		}).catch(e => {
			Logger.err('Could not create snippet revision after creation!');
			Logger.err(e);	
		});
	});

	return snippet;
};
