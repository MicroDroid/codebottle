import * as types from '../mutation-types';
import {unionState} from '../helpers';
import {apiUrl} from '../../helpers';

const state = () => ({
	new: [],
	searches: [],
	snippets: [],
});

const actions = {
	fetchNew({commit}) {
		return axios.get(apiUrl('/snippets')).then(response => {
			commit(types.STORE_NEW_SNIPPETS, response.data);
			return response.data;
		});
	},

	fetch({commit}, id) {
		return axios.get(apiUrl(`/snippets/${id}`)).then(response => {
			commit(types.STORE_SNIPPET, response.data);
			return response.data;
		});
	},

	fetchRevisions({commit}, snippet_id) {
		return axios.get(apiUrl(`/snippets/${snippet_id}/revisions`)).then(response => {
			commit(types.STORE_SNIPPET_REVISIONS, {snippet_id, revisions: response.data});
			return response.data;
		});
	},

	search({commit}, {keywords, language}) {
		return axios.get(apiUrl('/snippets'), {
			params: {keywords, language},
		}).then(response => {
			commit(types.STORE_SNIPPETS_SEARCH_RESULTS, {
				keywords,
				language,
				snippets: response.data,
			});

			return response.data;
		});
	},
};

const mutations = {
	[types.STORE_NEW_SNIPPETS] (state, snippets) {
		state.snippets = unionState(state.snippets, snippets);
		state.new = snippets.map(s => s.id);
	},

	[types.STORE_SNIPPET] (state, snippet) {
		state.snippets = unionState(state.snippets, [
			{
				...snippet,
				revisions: [],
				revisions_count: snippet.revisions,
			}
		]);
	},

	[types.STORE_SNIPPET_REVISIONS](state, payload) {
		const snippet = state.snippets.find(s => s.id === payload.snippet_id) || {
			id: payload.snippet_id,
			revisions: [],
		};

		snippet.revisions = payload.revisions;

		state.snippets = unionState(state.snippets, [snippet]);
	},

	[types.UPDATE_SNIPPET_CURRENT_VOTE](state, payload) {
		const snippet = state.snippets.find(s => s.id === payload.id);

		snippet.votes += payload.vote - snippet.currentVote;
		snippet.currentVote = payload.vote;

		state.snippets = unionState(state.snippets, [snippet]);
	},

	[types.STORE_SNIPPETS_SEARCH_RESULTS](state, {keywords, language, snippets}) {
		state.snippets = unionState(state.snippets, snippets);

		const existing = state.searches
			.find(s => s.keywords === keywords && s.language === language);

		if (existing)
			existing.snippets = snippets.map(s => s.id);
		else
			state.searches.push({
				keywords,
				language,
				snippets: snippets.map(s => s.id),
			});
	}
};

const getters = {
	getById: state => id => state.snippets.find(snippet => snippet.id === id),
	getNew: state => state.snippets.filter(s => state.new.includes(s.id)),

	getSearchResults: state => ({keywords, language}) => {
		const search = state.searches
			.find(s => s.keywords === keywords && s.language === language);

		return search && state.snippets.filter(s => search.snippets.includes(s.id))
			|| [];
	},
};

export default {
	namespaced: true,
	state, mutations, actions, getters
};