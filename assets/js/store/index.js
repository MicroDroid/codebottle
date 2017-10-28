import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
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
		user
	},
	
	state: {
		languages: [],
		categories: [],
		toast: {
			content: '',
			show: false,
		}
	},
	
	strict: debugging
});
