const gravatar = require('gravatar');

'use strict';
module.exports = (sequelize, DataTypes) => {
	const user = sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		bio: {
			type: DataTypes.STRING,
			allowNull: true
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
		created_at: {
			type: DataTypes.TIME,
			allowNull: false
		},
		updated_at: {
			type: DataTypes.TIME,
			allowNull: false
		},
		deleted_at: {
			type: DataTypes.TIME,
			allowNull: true
		},
	}, {
		paranoid: true,
	});

	user.associate = models => {
		user.hasMany(models.vote);
		user.hasMany(models.snippet);
		user.hasMany(models.socialConnection);
		user.hasOne(models.emailVerification);
		user.hasOne(models.passwordReset, {foreignKey: 'email'});
	};

	user.transform = (user, hideEmail = true, github) => {
		return {
			username: user.username,
			...!hideEmail && {email: user.email},
			...github && {github},
			bio: user.bio,
			profileImage: gravatar.url(user.email, {s: 512, d: 'mm', r: 'g'}, true),
			banned: user.banned,
			createdAt: user.created_at
		};
	};

	return user;
};
