const axios = require('axios');
const _ = require('lodash');
const logger = require('./utils/logger');
const dns = require('dns');
const models = require('./models');

const helpers = {
	verifyRecaptcha: async (token) => {
		const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
			token
		});

		return !!response.data.success;
	},

	// https://codebottle.io/s/5d0ad1219a
	generateCombinations: (combinations) => {
		let results = [];

		const generate = (filteredCombinations, combination) => {
			combination = combination ? combination : {};
			const key = Object.keys(filteredCombinations)[0];
			if (Object.keys(filteredCombinations).length === 0 && filteredCombinations.constructor === Object)
				results.push(combination);
			else
				filteredCombinations[key].forEach(value => {
					generate(_.omit(filteredCombinations, key), {
						...combination,
						[key]: value
					});
				});
		};

		generate(combinations);

		return results;
	},

	getGitHubUser: async (token) => {
		/* istanbul ignore next */
		const response = await axios.get(`https://api.github.com/user?access_token=${token}`)
			.catch(error => {
				if (error.response && error.response.data)
					logger.warn(`GitHub OAuth2.0 failed: [${error.response.status}] ${error.response.data.message}`);
				else
					logger.err('GitHub OAuth2.0 failed: Network error');

				throw error;
			});

		return response.data;
	},

	getGitHubUsername: async id => {
		const githubConnection = (await models.socialConnection.findAll({
			where: {
				user_id: id,
				service: 'github',
			}
		}))[0];

		if (!githubConnection)
			return null;

		const githubUser = await helpers.getGitHubUser(githubConnection.token);

		return githubUser.login;
	},

	isDdgBot: async ip => [
		'72.94.249.34',
		'72.94.249.35',
		'72.94.249.36',
		'72.94.249.37',
		'72.94.249.38',
	].indexOf(ip) !== -1,

	isGoogleBot: async ip => new Promise((resolve, reject) => {
		dns.reverse(ip, (err, hosts) => {
			if (err)
				reject(err);

			const host = hosts[0];

			if (!(host.endsWith('.googlebot.com') || host.endsWith('.google.com')))
				resolve(false);

			else dns.lookup(host, (err, addr) => {
				if (err)
					reject(err);

				resolve(addr === ip);
			});
		});
	}),

	isBingBot: async ip => new Promise((resolve, reject) => {
		dns.reverse(ip, (err, hosts) => {
			if (err)
				reject(err);

			const host = hosts[0];

			if (!host.endsWith('search.msn.com'))
				resolve(false);

			else dns.lookup(host, (err, addr) => {
				if (err)
					reject(err);

				resolve(addr === ip);
			});
		});
	}),
};


module.exports = helpers;