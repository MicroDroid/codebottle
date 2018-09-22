import * as types from './mutation-types';

export default {
	[types.STORE_LANGUAGES]: (state, data) => {
		state.languages = data;
	},

	[types.STORE_CATEGORIES]: (state, data) => {
		state.categories = data;
	},

	[types.COOK_TOAST]: (state, data) => {
		state.toast.content = data.content;
		state.toast.duration = data.duration;
	},

	[types.EAT_TOAST]: (state) => {
		state.toast.content = null;
		state.toast.duration = 0;
	}
};
