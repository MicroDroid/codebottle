require('./bootstrap');

export default [
	{
		name: 'discover',
		path: '/',
		component: require('./components/pages/Discover.vue'),
	},
	{
		name: 'search',
		path: '/search',
		component: require('./components/pages/Search.vue'),
	},
	{
		name: 'view-snippet',
		path: '/s/:id',
		component: require('./components/pages/ViewSnippet.vue'),
	},
	{
		name: 'view-user',
		path: '/users/:username',
		component: require('./components/pages/ViewUser.vue'),
	},
	{
		name: 'create',
		path: '/create',
		component: require('./components/pages/CreateSnippet.vue'),
		meta: {
			requiresAuth: true
		},
	},
	{
		name: 'edit-profile',
		path: '/edit-profile',
		component: require('./components/pages/EditProfile.vue'),
		meta: {
			requiresAuth: true
		},
	},
	{
		name: 'embedding',
		path: '/embedding',
		component: require('./components/pages/Embedding.vue'),
	},
	{
		name: 'signin',
		path: '/signin',
		component: require('./components/pages/SignIn.vue'),
	},
	{
		name: 'github-signin',
		path: '/signin/github',
		component: require('./components/pages/GitHubSignIn.vue'),
	},
	{
		name: 'signup',
		path: '/signup',
		component: require('./components/pages/SignUp.vue'),
	},
	{
		name: 'verify-email',
		path: '/verify-email',
		component: require('./components/pages/VerifyEmail.vue'),
	},
	{
		name: 'forgot-password',
		path: '/forgot-password',
		component: require('./components/pages/ForgotPassword.vue'),
	},
	{
		name: 'change-password',
		path: '/change-password',
		component: require('./components/pages/ChangePassword.vue'),
	},
	{
		name: 'privacy-policy',
		path: '/privacy-policy',
		component: require('./components/pages/PrivacyPolicy.vue'),
	},
	

	{
		name: 'settings.preferences',
		path: '/settings/preferences',
		component: require('./components/pages/settings/Preferences.vue'),
		meta: {
			requiresAuth: true
		},
	},
	// {
	// 	name: 'settings.oauth2',
	// 	path: '/settings/oauth2',
	// 	component: require('./components/pages/settings/OAuth2.vue'),
	// 	meta: {
	// 		requiresAuth: true
	// 	},
	// },
	// {
	// 	name: 'settings.oauth2.create-client',
	// 	path: '/settings/oauth2/create',
	// 	component: require('./components/pages/settings/OAuth2/CreateClient.vue'),
	// 	meta: {
	// 		requiresAuth: true
	// 	},
	// },
	// {
	// 	name: 'settings.oauth2.edit-client',
	// 	path: '/settings/oauth2/:id/edit',
	// 	component: require('./components/pages/settings/OAuth2/EditClient.vue'),
	// 	meta: {
	// 		requiresAuth: true
	// 	},
	// },
	
	// {
	// 	name: 'settings.personal-access-tokens',
	// 	path: '/settings/personal-access-tokens',
	// 	component: require('./components/pages/settings/PersonalAccessTokens.vue'),
	// 	meta: {
	// 		requiresAuth: true
	// 	},
	// },
	// {
	// 	name: 'settings.personal-access-tokens.create-token',
	// 	path: '/settings/personal-access-tokens/create',
	// 	component: require('./components/pages/settings/PersonalAccessTokens/CreateToken.vue'),
	// 	meta: {
	// 		requiresAuth: true
	// 	},
	// },

	{
		name: 'api.getting-started',
		path: '/api/docs/getting-started',
		component: require('./components/pages/api/GettingStarted.vue'),
	},
	// {
	// 	name: 'api.authentication',
	// 	path: '/api/docs/authentication',
	// 	component: require('./components/pages/api/Authentication.vue'),
	// },
	{
		name: 'api.languages',
		path: '/api/docs/languages',
		component: require('./components/pages/api/Languages.vue'),
	},
	{
		name: 'api.categories',
		path: '/api/docs/categories',
		component: require('./components/pages/api/Categories.vue'),
	},
	{
		name: 'api.snippets',
		path: '/api/docs/snippets',
		component: require('./components/pages/api/Snippets.vue'),
	},

	{
		name: 'NotFound',
		path: '*',
		component: require('./components/pages/NotFound.vue'),
	},

	// Redirects
	
	{
		path: '/settings',
		redirect: {
			name: 'settings.preferences'
		}
	},
	{
		path: '/api',
		redirect: {
			name: 'api.getting-started'
		}
	},
	{
		path: '/api/docs',
		redirect: {
			name: 'api.getting-started'
		}
	},
];
