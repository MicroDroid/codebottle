const gravatar = require('gravatar');

'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const user = sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		username: {
			type: DataTypes.STRING(191),
			allowNull: false,
			unique: true
		},
		email: {
			type: DataTypes.STRING(191),
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING(191),
			allowNull: true,
		},
		bio: {
			type: DataTypes.STRING(191),
			allowNull: true
		},
		admin: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		banned: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		activated: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
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

	user.associate = models => {
		user.hasMany(models.vote);
		user.hasMany(models.snippet);
		user.hasMany(models.socialConnection);
		user.hasOne(models.emailVerification);
		user.hasOne(models.userPreferences);
		user.hasOne(models.passwordReset, {foreignKey: 'email', targetKey: 'email'});
		user.hasMany(models.flag, {
			foreignKey: 'flaggable_id',
			scope: {
				flaggable_type: 'user',
			}
		});
	};

	user.transform = (user, hideEmail = true, github) => {
		return {
			username: user.username,
			...!hideEmail && {email: user.email},
			...github && {github},
			bio: user.bio,
			profileImage: gravatar.url(user.email, {s: 512, d: 'mm', r: 'g'}, true),
			banned: user.banned,
			admin: user.admin,
			createdAt: user.created_at
		};
	};

	return user;
};
