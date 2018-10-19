import './bootstrap';

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VueClipboards from 'vue-clipboards';
import VueAnalytics from 'vue-analytics';
import VueMeta from 'vue-meta';
import App from './components/App';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import root from 'window-or-global';

import routes from './routes';
import {createStore} from './store';

Vue.use(Vuex);

Vue.use(VueMeta, {
	keyName: 'meta',
});

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueClipboards);

Vue.component('navbar', Navbar);
Vue.component('loader', Loader);

export function createApp() {
	const store = createStore();

	root.axios.interceptors.response.use(response => response, error => {
		if (error && error.response && error.response.status === 401 && store.getters['auth/isAuthenticated']) {
			store.dispatch('toasts/addToast', {
				content:'You\'ve been logged out!',
				duration: 4500
			});
			store.dispatch('auth/logout');
		}

		return Promise.reject(error);
	});

	const router = new VueRouter({
		mode: 'history',
		linkActiveClass: 'active',
		routes,
		scrollBehavior: (to, from, savedPosition) => ({x: 0, y: 0}),
	});


	if (typeof(window) !== 'undefined' && window.__INITIAL_STATE__)
		store.replaceState(window.__INITIAL_STATE__);

	router.beforeEach((to, from, next) => {
		if (to.meta.requiresAuth && !store.getters['auth/isAuthenticated']) {
			next({name: 'signin'});
			store.dispatch('toasts/addToast', {
				content: 'Sign in first',
				duration: 2000
			});
		} else if ((to.name === 'signin' || to.name === 'signup') && store.getters['auth/isAuthenticated']) {
			next({name: 'discover'});
			store.dispatch('toasts/addToast', {
				content: 'You are already signed in!',
				duration: 2000
			});
		} else next();
	});

	if (process.env.NODE_ENV === 'production')
		Vue.use(VueAnalytics, {
			id: 'UA-80585608-1',
			router,
		});

	const app = new Vue({
		render: h => h(App),
		router,
		store,
	});

	return {app, router, store};
}
