const config = require('./config');
const Router = require('koa-router');
const router = new Router();
const compose = require('koa-compose');

const jwt = require('koa-jwt');
const auth = require('./middleware/auth');
const throttle = require('./middleware/throttle');
const denyBanned = require('./middleware/deny-banned');
const adminOnly = require('./middleware/admin-only');

const CategoryController = require('./controllers/category');
const LanguageController = require('./controllers/language');
const TagController = require('./controllers/tag');
const UserController = require('./controllers/user');
const AuthController = require('./controllers/auth');
const SnippetController = require('./controllers/snippet');
const SnippetRevisionController = require('./controllers/snippet-revision');
const VoteController = require('./controllers/vote');
const FlagController = require('./controllers/flag');
const UserPreferencesController = require('./controllers/user-preferences');

const protect = (passthrough = false) => {
	return compose([
		jwt({
			secret: config.jwt.secret,
			passthrough
		}),
		auth(passthrough),
		denyBanned,
	]);
};

module.exports = () => {
	router.get('/categories', throttle(), CategoryController.getAll);
	router.get('/categories/:id', throttle(), CategoryController.get);

	router.get('/languages', throttle(), LanguageController.getAll);
	router.post('/languages', throttle(), protect(), adminOnly, LanguageController.create);
	router.get('/languages/:id', throttle(), LanguageController.get);
	router.delete('/languages/:id', throttle(), protect(), adminOnly, LanguageController.delete);

	router.get('/tags', throttle(), TagController.getAll);
	router.get('/tags/:id', throttle(), TagController.get);
	router.post('/tags', throttle(), protect(), adminOnly, TagController.create);
	router.delete('/tags/:id', throttle(), protect(), adminOnly, TagController.delete);

	router.get('/tags/:id/snippets', throttle(), TagController.getSnippets);

	router.get('/snippets', throttle(), SnippetController.index);
	router.get('/snippets/:id', throttle(), protect(true), SnippetController.get);
	router.put('/snippets/:id/tags', throttle(), protect(), SnippetController.setTags);
	router.get('/snippets/:snippet_id/revisions', throttle(), SnippetRevisionController.getAll);
	router.get('/snippets/:snippet_id/revisions/:id', throttle(), SnippetRevisionController.get);

	router.post('/users', throttle(1, 900, true), UserController.create);
	router.post('/users/email-verifications', throttle(5, 120), UserController.verifyEmail);
	router.get('/users/:username', throttle(), UserController.get);
	router.delete('/users/:username', throttle(), protect(), UserController.delete);
	router.get('/users/:username/data', throttle(), protect(), UserController.collectData);
	router.get('/users/:username/snippets', throttle(), UserController.getSnippets);

	router.post('/auth/login', throttle(5, 120), AuthController.login);
	router.post('/auth/github', throttle(5, 120), AuthController.github);
	router.post('/auth/password/reset', throttle(5, 120), AuthController.resetPassword);
	router.post('/auth/password/change', throttle(5, 120), AuthController.changePassword);


	router.post('/snippets', throttle(5, 900, true), protect(), SnippetController.create);
	router.delete('/snippets/:id', throttle(), protect(), SnippetController.delete);
	router.put('/snippets/:id', throttle(), protect(), SnippetController.edit);
	router.post('/snippets/:snippet/vote', throttle(), protect(), VoteController.vote);

	router.get('/self', throttle(), protect(), UserController.getSelf);
	router.put('/self', throttle(), protect(), UserController.setSelf);

	router.get('/self/preferences', throttle(), protect(), UserPreferencesController.get);
	router.put('/self/preferences', throttle(), protect(), UserPreferencesController.set);

	router.post('/snippets/:id/flag', throttle(5, 900, true), protect(), FlagController.flagSnippet);
	router.post('/users/:username/flag', throttle(5, 900, true), protect(), FlagController.flagUser);

	return router;
};