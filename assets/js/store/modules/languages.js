import * as types from '../mutation-types';
import {apiUrl} from '../../helpers';
import {unionState} from '../helpers';

const state = () => ({
	languages: [],
});

const actions = {
	fetchAll({commit}) {
		return axios.get(apiUrl('/languages')).then(response => {
			commit(types.STORE_LANGUAGES, response.data);
		});
	},

	create({ commit }, { name }) {
		return axios.post(apiUrl('/languages'), { name }).then(response => {
			commit(types.STORE_LANGUAGES, [ response.data ]);
		});
	},

	delete({ commit }, { id }) {
		return axios.delete(apiUrl(`/languages/${id}`)).then(() => {
			commit(types.DELETE_LANGUAGE, id);
		});
	},
};

const mutations = {
	[types.STORE_LANGUAGES](state, languages) {
		state.languages = unionState(state.languages, languages);
	},

	[types.DELETE_LANGUAGE](state, id) {
		state.languages = state.languages.filter(l => l.id !== id);
	},
};

const getters = {
	getById: state => id => state.languages.find(language => language.id === id),
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};