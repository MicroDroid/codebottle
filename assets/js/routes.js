import Discover from './components/pages/Discover';
import Search from './components/pages/Search';
import Embedding from './components/pages/Embedding';

import Support from './components/pages/Support';
import NotFound from './components/pages/NotFound';
import PrivacyPolicy from './components/pages/PrivacyPolicy';

// Auth

import SignIn from './components/pages/auth/SignIn';
import GitHubSignIn from './components/pages/auth/GitHubSignIn';
import SignUp from './components/pages/auth/SignUp';
import VerifyEmail from './components/pages/auth/VerifyEmail';
import ForgotPassword from './components/pages/auth/ForgotPassword';
import ChangePassword from './components/pages/auth/ChangePassword';

// Snippets

import CreateSnippet from './components/pages/snippets/Create';
import ViewSnippet from './components/pages/snippets/View';
import EditSnippet from './components/pages/snippets/Edit';

// Snippet revisions

import SnippetRevisions from './components/pages/snippets/revisions/Index';
import ViewSnippetRevision from './components/pages/snippets/revisions/View';

// Users

import ViewUser from './components/pages/users/View';
import EditProfile from './components/pages/users/EditProfile';

// Languages

import Languages from './components/pages/languages/Index';

// Tags

import Tags from './components/pages/tags/Index';

// Settings

import Preferences from './components/pages/settings/Preferences';
import AccountManagement from './components/pages/settings/AccountManagement';

// API docs

import ApiDocs from './components/pages/api/Template';

export default [{
		name: 'discover',
		path: '/',
		component: Discover,
	}, {
		name: 'search',
		path: '/search',
		component: Search,
	}, {
		name: 'support',
		path: '/support',
		component: Support,
	}, {
		name: 'view-snippet',
		path: '/s/:id',
		component: ViewSnippet,
	}, {
		name: 'edit-snippet',
		path: '/s/:id/edit',
		component: EditSnippet,
	}, {
		name: 'snippet-revisions',
		path: '/s/:snippet_id/revisions',
		component: SnippetRevisions,
	}, {
		name: 'view-snippet-revision',
		path: '/s/:snippet_id/revisions/:id',
		component: ViewSnippetRevision,
	}, {
		name: 'view-user',
		path: '/users/:username',
		component: ViewUser,
	}, {
		name: 'create',
		path: '/create',
		component: CreateSnippet,
		meta: {
			requiresAuth: true,
		},
	}, {
		name: 'edit-profile',
		path: '/edit-profile',
		component: EditProfile,
		meta: {
			requiresAuth: true,
		},
	}, {
		name: 'languages',
		path: '/languages',
		component: Languages,
		meta: {
			requiresAuth: true,
			requiresAdmin: true,
		},
	}, {
		name: 'tags',
		path: '/tags',
		component: Tags,
		meta: {
			requiresAuth: true,
			requiresAdmin: true,
		},
	}, {
		name: 'embedding',
		path: '/embedding',
		component: Embedding,
	}, {
		name: 'signin',
		path: '/signin',
		component: SignIn,
	}, {
		name: 'github-signin',
		path: '/signin/github',
		component: GitHubSignIn,
	}, {
		name: 'signup',
		path: '/signup',
		component: SignUp,
	}, {
		name: 'verify-email',
		path: '/verify-email',
		component: VerifyEmail,
	}, {
		name: 'forgot-password',
		path: '/forgot-password',
		component: ForgotPassword,
	}, {
		name: 'change-password',
		path: '/change-password',
		component: ChangePassword,
	}, {
		name: 'privacy-policy',
		path: '/privacy-policy',
		component: PrivacyPolicy,
	},


	{
		name: 'settings.preferences',
		path: '/settings/preferences',
		component: Preferences,
		meta: {
			requiresAuth: true
		},
	},

	{
		name: 'settings.account-management',
		path: '/settings/account-management',
		component: AccountManagement,
		meta: {
			requiresAuth: true,
		},
	},

	// API Documentation

	{
		name: 'api.getting-started',
		path: '/api/docs/getting-started',
		component: ApiDocs,
		props: {
			title: 'Getting Started',
			description: 'Get started quickly into using our quota-less free API and integrate it with your application',
			content: require('../markdown/api-docs/getting-started.md'),
		},
	}, {
		name: 'api.authentication',
		path: '/api/docs/authentication',
		component: ApiDocs,
		props: {
			title: 'Authentication',
			description: 'Learn how to easily authenticate to our API using personal access tokens or OAuth 2.0 application tokens',
			content: require('../markdown/api-docs/authentication.md'),
		},
	}, {
		name: 'api.languages',
		path: '/api/docs/languages',
		component: ApiDocs,
		props: {
			title: 'Languages',
			description: 'Languages classify snippets, making it easy to reach the snippet that speaks the language of your project\'s',
			content: require('../markdown/api-docs/languages.md'),
		},
	}, {
		name: 'api.categories',
		path: '/api/docs/categories',
		component: ApiDocs,
		props: {
			title: 'Categories',
			description: 'Categories make it easy for plugins and scripts to determine the type of the snippet and import it properly',
			content: require('../markdown/api-docs/categories.md'),
		},
	}, {
		name: 'api.snippets',
		path: '/api/docs/snippets',
		component: ApiDocs,
		props: {
			title: 'Snippets',
			description: 'Snippets are at the core of the website, yet see how quickly and easily you can get started with them with our simple API',
			content: require('../markdown/api-docs/snippets.md'),
		},
	}, {
		name: 'api.snippet-revisions',
		path: '/api/docs/snippets/revisions',
		component: ApiDocs,
		props: {
			title: 'Snippet Revisions',
			description: 'Snippets revisions are edits made to the snippet since it has been created',
			content: require('../markdown/api-docs/snippet-revisions.md'),
		},
	},

	// Error handling

	{
		name: 'not-found',
		path: '/404',
		component: NotFound,
	},

	// Redirects

	{
		path: '/settings',
		redirect: {
			name: 'settings.preferences',
		},
	}, {
		path: '/api',
		redirect: {
			name: 'api.getting-started',
		},
	}, {
		path: '/api/docs',
		redirect: {
			name: 'api.getting-started',
		},
	}, {
		path: '*',
		redirect: {
			name: 'not-found',
		},
	},
];