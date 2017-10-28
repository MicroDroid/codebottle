const axios = require('axios');

module.exports = {
	verifyRecaptcha: async (token) => {
		const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
			token
		});

		return !!response.data.success;
	}
};
