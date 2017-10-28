import * as types from './mutation-types';

module.exports = {
	[types.STORE_LANGUAGES]: (state, data) => {
		state.languages = data;
	},

	[types.STORE_CATEGORIES]: (state, data) => {
		state.categories = data;
	},

	[types.COOK_TOAST]: (state, data) => {
		state.toast.content = data.content;
		state.toast.show = true;
	},

	[types.EAT_TOAST]: (state) => {
		state.toast.show = false;
	}
};
