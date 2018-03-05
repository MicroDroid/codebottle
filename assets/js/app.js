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

import routes from './routes';
import store from './store';
import {EAT_TOAST} from './store/mutation-types';
import {setStore, cookToast} from './helpers';

setStore(store);

Vue.use(VueMeta, {
	keyName: 'meta',
});

Vue.use(VueRouter);
Vue.use(Vuex);

Vue.component('navbar', Navbar);
Vue.component('loader', Loader);

root.axios.interceptors.response.use(response => response, error => {
	if (error.response.status === 401 && store.getters['auth/isAuthenticated']) {
		cookToast('You\'ve been logged out!', 4500);
		store.dispatch('auth/logout');
	}

	return Promise.reject(error);
});

const router = new VueRouter({
	mode: 'history',
	linkActiveClass: 'active',
	routes
});


if (typeof(window) !== 'undefined' && window.__INITIAL_STATE__) {
	store.replaceState(window.__INITIAL_STATE__);
	if (store.getters.toast.content)
		setTimeout(() => {
			store.commit(EAT_TOAST);
		}, store.getters.toast.duration);
}

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
