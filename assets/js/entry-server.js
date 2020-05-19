import root from 'window-or-global';
import {
	createApp
} from './app';

export default context => {
	root.location = {
		protocol: context.protocol,
		hostname: context.hostname,
	};

	root.serverRendering = true;
	root.apiProtocol = context.apiProtocol;
	root.apiHost = context.apiHost;

	return new Promise(async (resolve, reject) => {
		const {
			app,
			router,
			store
		} = createApp();

		// Used to parallelize requests
		const requests = [];

		requests.push(store.dispatch('languages/fetchAll'));
		requests.push(store.dispatch('categories/fetchAll'));

		if (context.authCookie) {
			try {
				const auth = JSON.parse(context.authCookie);
				if (auth.obtainedAt + auth.expiresIn > Date.now()) {
					root.document = {
						cookie: `auth=${context.authCookie}`,
					};
					store.commit('auth/LOGIN', auth);
					root.axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
					requests.push(store.dispatch('users/fetchSelf').catch(() => {
						store.dispatch('auth/logout');
					}));
					requests.push(store.dispatch('auth/fetchPreferences').catch(() => {
						store.dispatch('auth/logout');
					}));
				}
			} catch (e) {
				console.log('Invalid auth cookie passed to SSR');
			}
		}

		await Promise.all(requests);

		const {
			url
		} = context;
		// const { fullPath } = router.resolve(url).route;

		// if (fullPath !== url)
		// 	return reject({ url: fullPath });

		router.push(url);

		context.meta = app.$meta();

		router.onReady(() => {
			const matchedComponents = router.getMatchedComponents();

			if (!matchedComponents.length)
				return reject({
					code: 404
				});

			Promise.all(
				matchedComponents.map(({
					asyncData
				}) => asyncData && asyncData(
					store,
					router.currentRoute
				))).then(() => {
				context.state = store.state;
				resolve(app);
			}).catch(reject);
		}, reject);
	});
};