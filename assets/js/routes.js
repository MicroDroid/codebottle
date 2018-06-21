require('./bootstrap');

export default [
	{
		name: 'discover',
		path: '/',
		component: require('./components/pages/Discover.vue'),
	}, {
		name: 'search',
		path: '/search',
		component: require('./components/pages/Search.vue'),
	}, {
		name: 'view-snippet',
		path: '/s/:id',
		component: require('./components/pages/ViewSnippet.vue'),
	}, {
		name: 'edit-snippet',
		path: '/s/:id/edit',
		component: require('./components/pages/EditSnippet.vue'),
	}, {
		name: 'snippet-revisions',
		path: '/s/:snippet_id/revisions',
		component: require('./components/pages/SnippetRevisions.vue'),
	}, {
		name: 'view-snippet-revision',
		path: '/s/:snippet_id/revisions/:id',
		component: require('./components/pages/ViewSnippetRevision.vue'),
	}, {
		name: 'view-user',
		path: '/users/:username',
		component: require('./components/pages/ViewUser.vue'),
	}, {
		name: 'create',
		path: '/create',
		component: require('./components/pages/CreateSnippet.vue'),
		meta: {
			requiresAuth: true
		},
	}, {
		name: 'edit-profile',
		path: '/edit-profile',
		component: require('./components/pages/EditProfile.vue'),
		meta: {
			requiresAuth: true
		},
	}, {
		name: 'embedding',
		path: '/embedding',
		component: require('./components/pages/Embedding.vue'),
	}, {
		name: 'signin',
		path: '/signin',
		component: require('./components/pages/SignIn.vue'),
	}, {
		name: 'github-signin',
		path: '/signin/github',
		component: require('./components/pages/GitHubSignIn.vue'),
	}, {
		name: 'signup',
		path: '/signup',
		component: require('./components/pages/SignUp.vue'),
	}, {
		name: 'verify-email',
		path: '/verify-email',
		component: require('./components/pages/VerifyEmail.vue'),
	}, {
		name: 'forgot-password',
		path: '/forgot-password',
		component: require('./components/pages/ForgotPassword.vue'),
	}, {
		name: 'change-password',
		path: '/change-password',
		component: require('./components/pages/ChangePassword.vue'),
	}, {
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

	// API Documentation

	{
		name: 'api.getting-started',
		path: '/api/docs/getting-started',
		component: require('./components/pages/api/Template.vue'),
		props: {
			title: 'Getting Started',
			description: 'Get started quickly into using our quota-less free API and integrate it with your application',
			content: require('../markdown/api-docs/getting-started.md'),
		},
	}, {
		name: 'api.authentication',
		path: '/api/docs/authentication',
		component: require('./components/pages/api/Template.vue'),
		props: {
			title: 'Authentication',
			description: 'Learn how to easily authenticate to our API using personal access tokens or OAuth 2.0 application tokens',
			content: require('../markdown/api-docs/authentication.md'),
		},
	}, {
		name: 'api.languages',
		path: '/api/docs/languages',
		component: require('./components/pages/api/Template.vue'),
		props: {
			title: 'Languages',
			description: 'Languages classify snippets, making it easy to reach the snippet that speaks the language of your project\'s',
			content: require('../markdown/api-docs/languages.md'),
		},
	}, {
		name: 'api.categories',
		path: '/api/docs/categories',
		component: require('./components/pages/api/Template.vue'),
		props: {
			title: 'Categories',
			description: 'Categories make it easy for plugins and scripts to determine the type of the snippet and import it properly',
			content: require('../markdown/api-docs/categories.md'),
		},
	}, {
		name: 'api.snippets',
		path: '/api/docs/snippets',
		component: require('./components/pages/api/Template.vue'),
		props: {
			title: 'Snippets',
			description: 'Snippets are at the core of the website, yet see how quickly and easily you can get started with them with our simple API',
			content: require('../markdown/api-docs/snippets.md'),
		},
	},

	// Error handling

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
	}, {
		path: '/api',
		redirect: {
			name: 'api.getting-started'
		}
	}, {
		path: '/api/docs',
		redirect: {
			name: 'api.getting-started'
		}
	},
];
