'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const tag = sequelize.define('tag', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(16),
			allowNull: false,
		},
		created_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false,
		},
		updated_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false,
		},
	}, {});

	tag.associate = models => {
		tag.belongsToMany(models.snippet, {
			through: 'snippet_tags',
			foreignKey: 'tag_id',
		});
	};

	tag.transform = tag => ({
		id: tag.id,
		name: tag.name,
	});

	return tag;
};
