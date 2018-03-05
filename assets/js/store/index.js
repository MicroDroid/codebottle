import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import snippets from './modules/snippets';
import users from './modules/users';
import actions from './actions';
import mutations from './mutations';
import * as getters from './getters';

Vue.use(Vuex);

const debugging = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
	actions,
	mutations,
	getters,
	modules: {
		snippets,
		users,
		auth,
	},
	
	state: {
		languages: [],
		categories: [],
		toast: {
			content: null,
			duration: 0,
		}
	},
	
	strict: debugging
});
