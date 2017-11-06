/* istanbul ignore next */
module.exports = {
	sequelize: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: process.env.DB_DIALECT,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,

		timezone: process.env.TIMEZONE || '+00:00',

		operatorsAliases: false,
		
		define: {
			underscored: true,
			underscoredAll: true,
		},

		logging: process.env.LOGGING ? (process.env.LOGGING === 'true' ? console.log : null)
			: process.env.NODE_ENV === 'development' ? console.log : null,
	},

	logging: process.env.LOGGING ? process.env.LOGGING === 'true' : process.env.NODE_ENV !== 'testing',

	jwt: {
		secret: process.env.JWT_SECRET,
	},

	bcrypt: {
		saltRounds: 10,
	},

	redis: {
		host: process.env.REDIS_HOST || '127.0.0.1',
		port: process.env.REDIS_PORT || 6379,
		password: process.env.REDIS_PASSWORD,
	},

	mailgun: {
		domain: process.env.MAILGUN_DOMAIN,
		apiKey: process.env.MAILGUN_API_KEY,
	},

	recaptcha: {
		secret: process.env.RECAPTCHA_SECRET,
	}
};
