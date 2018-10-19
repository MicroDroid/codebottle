import * as types from '../mutation-types';
import {apiUrl} from '../../helpers';

const state = () => ({
	new: [],
	snippets: [],
});

const actions = {
	fetchNew: ({commit}) => {
		return axios.get(apiUrl('/snippets')).then(response => {
			commit(types.STORE_NEW_SNIPPETS, response.data);
			return response.data;
		});
	},

	fetch: ({commit}, id) => {
		return axios.get(apiUrl(`/snippets/${id}`)).then(response => {
			commit(types.STORE_SNIPPET, response.data);
			return response.data;
		});
	},

	fetchRevisions: ({commit}, snippet_id) => {
		return axios.get(apiUrl(`/snippets/${snippet_id}/revisions`)).then(response => {
			commit(types.STORE_SNIPPET_REVISIONS, {snippet_id, revisions: response.data});
			return response.data;
		});
	}
};

const mutations = {
	[types.STORE_NEW_SNIPPETS] (state, snippets) {
		state.new = snippets;
	},

	[types.STORE_SNIPPET] (state, snippet) {
		state.snippets = state.snippets.filter(s => s.id !== snippet.id);
		state.snippets.push({
			...snippet,
			revisions: [],
			revisions_count: snippet.revisions,
		});
	},

	[types.STORE_SNIPPET_REVISIONS](state, payload) {
		let snippet = state.snippets.filter(s => s.id === payload.snippet_id)[0];

		if (!snippet) {
			snippet = {
				id: payload.snippet_id,
				revisions: payload.revisions
			};
			state.snippets.push(snippet);
		} else snippet.revisions = payload.revisions;
	},

	[types.STORE_SNIPPET_REVISIONS](state, payload) {
		let snippet = state.snippets.filter(s => s.id === payload.snippet_id)[0];

		if (!snippet) {
			snippet = {
				id: payload.snippet_id,
				revisions: payload.revisions
			};
			state.snippets.push(snippet);
		} else snippet.revisions = payload.revisions;
	},

	[types.UPDATE_SNIPPET_CURRENT_VOTE](state, payload) {
		let snippet = state.snippets.filter(s => s.id === payload.id)[0];
		snippet.votes += payload.vote - snippet.currentVote;
		snippet.currentVote = payload.vote;
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