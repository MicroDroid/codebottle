import * as types from './mutation-types';

export default {
	[types.STORE_LANGUAGES]: (state, data) => {
		state.languages = data;
	},

	[types.STORE_CATEGORIES]: (state, data) => {
		state.categories = data;
	},
};
