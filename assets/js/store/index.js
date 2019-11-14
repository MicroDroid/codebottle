import Vuex from 'vuex';

import auth from './modules/auth';
import snippets from './modules/snippets';
import users from './modules/users';
import toasts from './modules/toasts';
import languages from './modules/languages';
import categories from './modules/categories';

import actions from './actions';
import mutations from './mutations';
import * as getters from './getters';

const debugging = process.env.NODE_ENV !== 'production';

export function createStore() {
	return new Vuex.Store({
		actions,
		mutations,
		getters,

		modules: {
			snippets,
			users,
			auth,
			toasts,
			languages,
			categories,
		},

		strict: debugging
	});
}
