import * as types from '../mutation-types';
import {apiUrl} from '../../helpers';

const state = () => ({
	self: false,
	users: [],
});

const actions = {
	fetch: ({commit}, username) => {
		return axios.get(apiUrl(`/users/${username}`))
			.then(response => {
				commit(types.STORE_USER, response.data);
		});
	},

	fetchSelf: ({commit}) => {
		return axios.get(apiUrl('/self'))
			.then(response => {
				commit(types.STORE_SELF, response.data);
		});
	},

	fetchUserSnippets: ({commit}, username) => {
		return axios.get(apiUrl(`/users/${username}/snippets`))
			.then(response => {
				commit(types.STORE_USER_SNIPPETS, {
					username,
					snippets: response.data
				});
		});
	}
};

const mutations = {
	[types.STORE_USER](state, user) {
		state.users = state.users.filter(u => u.username !== user.username);
		state.users.push(user);
	},

	[types.STORE_USER_SNIPPETS](state, payload) {
		let user = state.users.filter(u => u.username === payload.username)[0];

		if (!user) {
			user = {username: payload.username};
			state.users.push(user);
		}

		user.snippets = payload.snippets;
	},

	[types.STORE_SELF] (state, user) {
		state.self = user;
	}
};

const getters = {
	getByUsername: state => username => {
		return state.users.filter(user => user.username === username)[0];
	}
};

export default {
	namespaced: true,
	state, mutations, actions, getters
};