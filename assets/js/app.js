'use strict';

require('./bootstrap');

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VueAnalytics from 'vue-analytics';
import VueMeta from 'vue-meta';
import App from './components/App';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import root from 'window-or-global';

import {LOGIN, LOGOUT} from './store/mutation-types';
import routes from './routes';
import store from './store';
import {setStore, cookToast} from './helpers';

setStore(store);

Vue.use(VueMeta, {
	keyName: 'meta',
});

Vue.use(VueRouter);
Vue.use(Vuex);

Vue.component('navbar', Navbar);
Vue.component('loader', Loader);

root.axios.interceptors.response.use(function (response) {
	return response;
}, function (error) {
	if (error.response.status === 401) {
		cookToast('You\'ve been logged out!', 1500);
		store.state.auth.commit(LOGOUT);
	}
});

const router = new VueRouter({
	mode: 'history',
	linkActiveClass: 'active',
	routes
});


if (typeof(window) !== 'undefined' && window.__INITIAL_STATE__)
	store.replaceState(window.__INITIAL_STATE__);

router.beforeEach((to, from, next) => {
	if (to.meta.requiresAuth && !store.getters['auth/isAuthenticated']) {
		next({name: 'signin'});
		cookToast('Sign in first', 2000);
	} else if ((to.name === 'signin' || to.name === 'signup')
					&& store.getters['auth/isAuthenticated']) {
		next({name: 'discover'});
		cookToast('You are already signed in!', 2000);
	} else next();
});

if (process.env.NODE_ENV === 'production')
	Vue.use(VueAnalytics, {
		id: 'UA-80585608-1',
		router,
	});

export function createApp() {
	const app = new Vue({
		render: h => h(App),
		router,
		store,
	});

	return {app, router, store};
}
