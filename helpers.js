const axios = require('axios');
const _ = require('lodash');
const logger = require('./utils/logger');
const dns = require('dns');
const models = require('./models');
const config = require('./config');

/* istanbul ignore next */
const helpers = {
	verifyRecaptcha: async (token) => {
		const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', {}, {
			params: {
				secret: config.recaptcha.secret,
				response: token,
			}
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

	getGitHubUserEmails: async (token) => {
		/* istanbul ignore next */
		const response = await axios.get(`https://api.github.com/user/emails?access_token=${token}`)
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
			},
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

	genBadge: (left, right, color) =>
		`<svg xmlns="http://www.w3.org/2000/svg" width="${(left.length + right.length) * 6 + 20}" height="20">
			<linearGradient id="b" x2="0" y2="100%">
				<stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
				<stop offset="1" stop-opacity=".1"/>
			</linearGradient>
			<mask id="a"><rect width="${(left.length + right.length) * 6 + 20}" height="20" fill="#fff"/></mask>
			<g mask="url(#a)">
				<path fill="#555" d="M0 0h${left.length * 6 + 10}v20H0z"/>
				<path fill="${color}" d="M${left.length * 6 + 10} 0h${right.length * 6 + 10}v20H${left.length * 6 + 10}z"/>
				<path fill="url(#b)" d="M0 0h${(left.length + right.length) * 6 + 20}v20H0z"/>
			</g>
			<g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
				<text x="${(left.length * 6)/2 + 4}" y="15" fill="#010101" fill-opacity=".3">${left}</text>
				<text x="${(left.length * 6)/2 + 4}" y="14">${left}</text>
				<text x="${((right.length * 6)/2) + 14 + (left.length * 6)}" y="15" fill="#010101" fill-opacity=".3">${right}</text>
				<text x="${(right.length * 6)/2 + 14 + left.length * 6}" y="14">${right}</text>
			</g>
		</svg>`
};


module.exports = helpers;