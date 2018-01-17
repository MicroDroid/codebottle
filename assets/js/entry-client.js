import {createApp} from './app';

const {app, router, store} = createApp();

function getCookie(name) {
	var value = '; ' + document.cookie;
	var parts = value.split('; ' + name + '=');
	if (parts.length == 2) return parts.pop().split(';').shift();
}

const authCookie = getCookie('auth');

if (authCookie) {
	try {
		const auth = JSON.parse(authCookie);
		if (auth.token !== store.state.auth.accessToken)
			console.error('Auth token mismatch!');
		else if (auth.obtainedAt + auth.expiresIn > Date.now()) {
			store.commit('auth/LOGIN', auth);
			window.axios.defaults.headers.common = {
				'Authorization': 'Bearer ' + auth.token,
				...window.axios.defaults.headers.common,
			};
		} else
			document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
	} catch (e) {
		console.error('Invalid auth cookie!');
	}
}

router.onReady(() => {
	router.beforeResolve((to, from, next) => {
		const matched = router.getMatchedComponents(to);
		const prevMatched = router.getMatchedComponents(from);

		let diffed = false;
		const activated = matched.filter((c, i) => {
			return diffed || (diffed = (prevMatched[i] !== c));
		});

		if (!activated.length) {
			return next();
		}
		Promise.all(activated.map(c => {
			if (c.asyncData) {
				return c.asyncData(store, to);
			}
		})).then(() => {
			next();
		}).catch(next);
	});

	app.$mount('#app');
});

require('pace-progress').start();
