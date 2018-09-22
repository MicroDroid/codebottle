import Discover from './components/pages/Discover';
import Search from './components/pages/Search';
import Support from './components/pages/Support';
import ViewSnippet from './components/pages/ViewSnippet';
import EditSnippet from './components/pages/EditSnippet';
import SnippetRevisions from './components/pages/SnippetRevisions';
import ViewSnippetRevision from './components/pages/ViewSnippetRevision';
import ViewUser from './components/pages/ViewUser';
import CreateSnippet from './components/pages/CreateSnippet';
import EditProfile from './components/pages/EditProfile';
import Embedding from './components/pages/Embedding';
import SignIn from './components/pages/SignIn';
import GitHubSignIn from './components/pages/GitHubSignIn';
import SignUp from './components/pages/SignUp';
import VerifyEmail from './components/pages/VerifyEmail';
import ForgotPassword from './components/pages/ForgotPassword';
import ChangePassword from './components/pages/ChangePassword';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import Preferences from './components/pages/settings/Preferences';
import ApiDocs from './components/pages/api/Template';
import NotFound from './components/pages/NotFound';

export default [
	{
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
			requiresAuth: true
		},
	}, {
		name: 'edit-profile',
		path: '/edit-profile',
		component: EditProfile,
		meta: {
			requiresAuth: true
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
		name: 'NotFound',
		path: '*',
		component: NotFound,
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
