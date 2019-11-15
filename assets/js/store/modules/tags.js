import * as types from '../mutation-types';
import { apiUrl } from '../../helpers';
import { unionState } from '../helpers';

const state = () => ({
	tags: [],
});

const actions = {
	fetchAll({ commit }) {
		return axios.get(apiUrl('/tags')).then(response => {
			commit(types.STORE_TAGS, response.data);
		});
	},

	create({ commit }, { name }) {
		return axios.post(apiUrl('/tags'), { name }).then(response => {
			commit(types.STORE_TAGS, [ response.data ]);
		});
	},

	delete({ commit }, { id }) {
		return axios.delete(apiUrl(`/tags/${id}`)).then(() => {
			commit(types.DELETE_TAG, id);
		});
	},
};

const mutations = {
	[types.STORE_TAGS](state, tags) {
		state.tags = unionState(state.tags, tags);
	},

	[types.DELETE_TAG](state, id) {
		state.tags = state.tags.filter(l => l.id !== id);
	},
};

const getters = {
	getById: state => id => state.tags.find(tag => tag.id === id),
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};