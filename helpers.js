const axios = require('axios');
const _ = require('lodash');

module.exports = {
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
	}
};
