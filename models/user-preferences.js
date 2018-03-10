'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const userPreferences = sequelize.define('userPreferences', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			unique: true
		},
		private_email: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		indentation_size: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 4,
		},
		convert_tabs_to_spaces: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
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
		name: {
			singular: 'userPreferences'
		}
	});

	userPreferences.associate = models => {
		userPreferences.belongsTo(models.user);
	};

	userPreferences.transform = prefs => ({
		privateEmail: !prefs.private_email || prefs.private_email === '0' ? false : true, // TODO: ?: should be removed later
		indentationSize: prefs.indentation_size,
		convertTabsToSpaces: prefs.convert_tabs_to_spaces,
		updatedAt: prefs.updated_at,
	});

	return userPreferences;
};