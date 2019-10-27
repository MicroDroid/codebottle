/* istanbul ignore next */
module.exports = {
	http: {
		apiPort: process.env.API_PORT || 3000,
		assetsPort: process.env.ASSETS_PORT || 3001,
	},

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

		pool: {
			min: 1, // min connections
			max: 10, // max connections
			acquire: 20000, // connection timeout
			idle: 60000, // Idle connections are dmuped after this
		},
	},

	logging: {
		http: process.env.LOG_HTTP !== 'false', // defaults true
		sql: process.env.LOG_SQL === 'true', // defaults false
	},

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
	},

	hooks: {
		discord: {
			runtime: process.env.DISCORD_RUNTIME_WEBHOOK
		}
	},

	oauth: {
		github: {
			clientId: process.env.OAUTH_GITHUB_CLIENT_ID,
			clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
			redirectUri: process.env.OAUTH_GITHUB_REDIRECT_URI,
		}
	}
};
