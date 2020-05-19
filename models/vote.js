'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const vote = sequelize.define('vote', {
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
		snippet_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		vote: {
			type: DataTypes.INTEGER,
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
	}, {});

	vote.transform = vote => ({
		user_id: vote.user_id,
		snippet_id: vote.snippet_id,
		vote: vote.vote,
		created_at: vote.created_at,
		updated_at: vote.updated_at,
	});

	vote.associations = models => {
		vote.belongsTo(models.snippet);
		vote.belongsTo(models.user);
	};

	return vote;
};