const config = require('./config');
const Router = require('koa-router');
const router = new Router();
const compose = require('koa-compose');

const jwt = require('koa-jwt');
const auth = require('./middleware/auth');
const throttle = require('./middleware/throttle');
const denyBanned = require('./middleware/deny-banned');

const CategoryController = require('./controllers/category');
const LanguageController = require('./controllers/language');
const UserController = require('./controllers/user');
const AuthController = require('./controllers/auth');
const SnippetController = require('./controllers/snippet');
const VoteController = require('./controllers/vote');
const FlagController = require('./controllers/flag');
const UserPreferencesController = require('./controllers/user-preferences');

const protect = (passthrough = false) => {
	return compose([
		jwt({secret: config.jwt.secret, passthrough}),
		auth(passthrough),
		denyBanned,
	]);
};

module.exports = () => {
	router.get('/categories', throttle(), CategoryController.getAll);
	router.get('/categories/:id', throttle(), CategoryController.get);

	router.get('/languages', throttle(), LanguageController.getAll);
	router.get('/languages/:id', throttle(), LanguageController.get);

	router.get('/snippets', throttle(), SnippetController.index);
	router.get('/snippets/:id', throttle(), protect(true), SnippetController.get);

	router.post('/users', throttle(1, 900, true), UserController.create);
	router.post('/users/email-verifications', throttle(5, 120), UserController.verifyEmail);
	router.get('/users/:username', throttle(), UserController.get);
	router.get('/users/:username/snippets', throttle(), UserController.getSnippets);

	router.post('/auth/login', throttle(5, 120), AuthController.login);
	router.post('/auth/github', throttle(5, 120), AuthController.github);
	router.post('/auth/password/reset', throttle(5, 120), AuthController.resetPassword);
	router.post('/auth/password/change', throttle(5, 120), AuthController.changePassword);

	// Protected end-points

	router.post('/snippets', throttle(5, 900, true), protect(), SnippetController.create);
	router.delete('/snippets/:id', throttle(), protect(), SnippetController.delete);
	router.post('/snippets/:snippet/vote', throttle(), protect(), VoteController.vote);
	router.get('/self', throttle(), protect(), UserController.getSelf);
	router.put('/self', throttle(), protect(), UserController.setSelf);

	router.get('/self/preferences', throttle(), protect(), UserPreferencesController.get);
	router.put('/self/preferences', throttle(), protect(), UserPreferencesController.set);

	router.post('/snippets/:id/flag', throttle(5, 900, true), protect(), FlagController.flagSnippet);
	router.post('/users/:username/flag', throttle(5, 900, true), protect(), FlagController.flagUser);

	return router;
};
