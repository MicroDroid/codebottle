import * as types from '../mutation-types';
import {apiUrl} from '../../helpers';

const state = {
	new: [],
	snippets: [],
};

const actions = {
	fetchNew: ({commit}) => {
		return axios.get(apiUrl('/snippets'))
			.then(response => {
				commit(types.STORE_NEW_SNIPPETS, response.data);
			});
	},

	fetch: ({commit}, id) => {
		return axios.get(apiUrl(`/snippets/${id}`))
			.then(response => {
				commit(types.STORE_SNIPPET, response.data);
			});
	}
};

const mutations = {
	[types.STORE_NEW_SNIPPETS] (state, snippets) {
		state.new = snippets;
	},

	[types.STORE_SNIPPET] (state, snippet) {
		state.snippets = state.snippets.filter(s => s.id !== snippet.id);
		state.snippets.push(snippet);
	}
};

const getters = {
	getById: state => id => {
		return state.snippets.filter(snippet => snippet.id === id)[0];
	}
};

export default {
	namespaced: true,
	state, mutations, actions, getters
};