const config = require('./config');
const Router = require('koa-router');
const router = new Router();
const compose = require('koa-compose');

const jwt = require('koa-jwt');
const auth = require('./middleware/auth');
const throttle = require('./middleware/throttle');

const CategoryController = require('./controllers/category');
const LanguageController = require('./controllers/language');
const UserController = require('./controllers/user');
const AuthController = require('./controllers/auth');
const SnippetController = require('./controllers/snippet');

const protect = (passthrough = false) => {
	return compose([
		jwt({secret: config.jwt.secret, passthrough}),
		auth(passthrough),
	]);
};

module.exports = () => {
	router.get('/categories', throttle(), CategoryController.getAll);
	router.get('/categories/:id', throttle(), CategoryController.get);

	router.get('/languages', throttle(), LanguageController.getAll);
	router.get('/languages/:id', throttle(), LanguageController.get);

	router.get('/snippets', throttle(), SnippetController.index);
	router.get('/snippets/:id', throttle(), protect(true), SnippetController.get);

	router.post('/users', throttle(1, 900), UserController.create);
	router.post('/users/email-verifications', throttle(5, 120), UserController.verifyEmail);
	router.get('/users/:username', throttle(), UserController.get);

	router.post('/auth/login', throttle(5, 120), AuthController.login);
	router.post('/auth/password/reset', throttle(5, 120), AuthController.resetPassword);

	return router;
};
