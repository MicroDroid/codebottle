import * as types from '../mutation-types';
import {apiUrl} from '../../helpers';
import {unionState} from '../helpers';

const state = () => ({
	categories: [],
});

const actions = {
	fetchAll({commit}) {
		return axios.get(apiUrl('/categories')).then(response => {
			commit(types.STORE_CATEGORIES, response.data);
		});
	},
};

const mutations = {
	[types.STORE_CATEGORIES]: (state, categories) => {
		state.categories = unionState(state.categories, categories);
	},
};

const getters = {
	getById: state => id => state.categories.find(category => category.id === id),
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};