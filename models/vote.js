'use strict';
module.exports = (sequelize, DataTypes) => {
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
			type: DataTypes.TIME,
			allowNull: false
		},
		updated_at: {
			type: DataTypes.TIME,
			allowNull: false
		}
	}, {});

	vote.associations = models => {
		vote.belongsTo(models.snippet);
		vote.belongsTo(models.user);
	};
	
	return vote;
};