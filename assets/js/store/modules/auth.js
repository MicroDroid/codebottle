import * as types from '../mutation-types';
import root from 'window-or-global';
import {
	apiUrl
} from '../../helpers';

const state = () => ({
	accessToken: null,
	expiresIn: 0,
	obtainedAt: 0,
	preferences: {
		convert_tabs_to_spaces: false,
		indentation_size: 4,
	},
});

const actions = {
	login: ({
		commit
	}, credentials) => {
		return axios.post(apiUrl('/auth/login'), {
			username: credentials.username,
			password: credentials.password,
		}).then(response => {
			const auth = {
				token: response.data.token,
				expiresIn: response.data.expiresIn * 1000,
				obtainedAt: Date.now(),
			};

			document.cookie = `auth=${JSON.stringify(auth)}; path=/; SameSite=Lax;`;
			root.axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

			commit(types.LOGIN, auth);
		});
	},

	fetchPreferences: ({
		commit
	}) => {
		return axios.get(apiUrl('/self/preferences'))
			.then(response => {
				commit(types.STORE_PREFERENCES, response.data);
			});
	},

	githubLogin: ({
		commit
	}, payload) => {
		return axios.post(apiUrl('/auth/github'), payload)
			.then(response => {
				const auth = {
					token: response.data.token,
					expiresIn: response.data.expiresIn * 1000,
					obtainedAt: Date.now(),
				};

				window.axios.defaults.headers.common = {
					'Authorization': 'Bearer ' + auth.token,
					...window.axios.defaults.headers.common,
				};


				document.cookie = `auth=${JSON.stringify(auth)}; path=/; SameSite=Lax;`;
				root.axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

				commit(types.LOGIN, auth);
			});
	},

	logout: ({
		commit
	}) => {
		document.cookie = 'auth=; path=/; SameSite=Lax;';
		delete root.axios.defaults.headers.common['Authorization'];
		commit(types.LOGOUT);
	}
};

const mutations = {
	[types.LOGIN](state, payload) {
		state.accessToken = payload.token;
		state.expiresIn = payload.expiresIn;
		state.obtainedAt = payload.obtainedAt ? payload.obtainedAt : Date.now();
	},

	[types.LOGOUT](state) {
		state.accessToken = null;
		state.expiresIn = 0;
		state.obtainedAt = 0;
		state.preferences = {
			convertTabsToSpaces: false,
			indentationSize: 4,
		};
	},

	[types.STORE_PREFERENCES](state, prefs) {
		state.preferences = prefs;
	}
};

const getters = {
	isAuthenticated: state => state.accessToken ? ((state.obtainedAt + state.expiresIn > Date.now()) ?
		true :
		false) : false,
	preferences: state => state.preferences,
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};