import root from 'window-or-global';
import {createApp} from './app';
const isDev = process.env.NODE_ENV !== 'production';

module.exports = context => {
	root.location = {
		protocol: context.protocol + ':',
		hostname: context.hostname,
	};
	
	root.serverRendering = true;
	root.apiHost = context.apiHost;

	return new Promise(async (resolve, reject) => {
		const s = isDev && Date.now();
		const {app, router, store} = createApp();

		await store.dispatch('fetchLanguages');
		await store.dispatch('fetchCategories');

		if (context.authCookie) {
			try {
				const auth = JSON.parse(context.authCookie);
				if (auth.obtainedAt + auth.expiresIn > Date.now()) {
					root.document = {cookie: `auth=${context.authCookie}`};
					store.commit('auth/LOGIN', auth);
					root.axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
					await store.dispatch('auth/fetchPreferences');
					await store.dispatch('users/fetchSelf');
				}
			} catch (e) {
				console.log('Invalid auth cookie passed to SSR');
			}
		}

		const {url} = context;
		const {fullPath} = router.resolve(url).route;

		if (fullPath !== url)
			return reject({url: fullPath});

		router.push(url);

		context.meta = app.$meta();

		router.onReady(() => {
			const matchedComponents = router.getMatchedComponents();
			if (!matchedComponents.length)
				return reject({ code: 404 });
			Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData(
				store,
				router.currentRoute
			))).then(() => {
				isDev && console.log(`SSR data prefetch: ${Date.now() - s}ms`);
				context.state = store.state;
				resolve(app);
			}).catch(reject);
		}, reject);
	});
};
