'use strict';

require('./bootstrap');

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VueAnalytics from 'vue-analytics';
import VueHead from 'vue-head';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import routes from './routes';
import store from './store';
import * as types from './store/mutation-types';
import {mapGetters} from 'vuex';
import {setStore, cookToast} from './helpers';

setStore(store);

Vue.use(VueHead, {
	separator: '-',
});

Vue.use(VueRouter);
Vue.use(Vuex);

Vue.component('navbar', Navbar);
Vue.component('loader', Loader);

// window.axios.interceptors.response.use(function (response) {
// 	return response;
// }, function (error) {
// 	if (error.response.status === 401) {
// 		cookToast('You\'ve been logged out!', 1500);
// 		store.dispatch('logout');
// 	}
// });

const auth = window.localStorage.getItem('auth') ? JSON.parse(window.localStorage.getItem('auth')) : null;

if (auth && auth.obtainedAt + auth.expiresIn > Date.now()) {
	store.commit(types.LOGIN, auth);

	window.axios.defaults.headers.common = {
		'Authorization': 'Bearer ' + auth.token,
		...window.axios.defaults.headers.common,
	};

	store.dispatch('fetchPreferences');
}

const router = new VueRouter({
	mode: 'history',
	linkActiveClass: 'active',
	routes
});

router.beforeEach((to, from, next) => {
	if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
		next({
			name: 'signin'});
		cookToast('Sign in first', 2000);
	} else if (to.name === 'signin' && store.getters.isAuthenticated) {
		next({
			name: 'discover'});
		cookToast('You are already signed in!', 2000);
	} else next();
});

if (process.env.NODE_ENV === 'production')
	Vue.use(VueAnalytics, {
		id: 'UA-80585608-1',
		router,
	});

const app = new Vue({
	computed: {
		...mapGetters([
			'toast',
		])
	},

	components: {
		Toast,
	},

	router,
	store
}).$mount('#app');

store.dispatch('fetchLanguages');
store.dispatch('fetchCategories');
