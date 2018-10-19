import * as types from '../mutation-types';
import {genRandomString} from '../../helpers';

const state = () => ({
	toasts: [],
});

const actions = {
	addToast({commit}, {content, duration}) {
		if (!content)
			throw new Error('Adding toast with no content');
		
		commit(types.ADD_TOAST, {
			content,
			duration: duration || 3000,
		});
	},

	removeToast({commit}, id) {
		commit(types.REMOVE_TOAST, id);
	}
};

const mutations = {
	[types.ADD_TOAST](state, {content, duration}) {
		state.toasts.push({
			id: genRandomString(8),
			duration,
			content,
		});
	},

	[types.REMOVE_TOAST](state, id) {
		state.toasts = state.toasts.filter(toast => toast.id !== id);
	},
};

const getters = {
	firstToast: state => state.toasts[0],
};

export default {
	namespaced: true,
	state, mutations, actions, getters
};