require('dotenv').config();

const Sequelize = require('sequelize');
const Koa = require('koa');
const app = new Koa();
const fs = require('pn/fs');
const path = require('path');
const ejs = require('ejs');

const helpers = require('./helpers');
const models = require('./models');
const handler = require('./middleware/handler');
const loggerMiddleware = require('./middleware/logger')('res');
const logger = require('./utils/logger');

const koaConditional = require('koa-conditional-get');
const koaEtag = require('koa-etag');
const koaStatic = require('koa-static');
const koaCompress = require('koa-compress');

const LRU = require('lru-cache');
const debounce = require('lodash.debounce');

const {createBundleRenderer} = require('vue-server-renderer');

function createAppRenderer() {
	const template = fs.readFileSync(path.join(__dirname, 'build', 'index.html'), 'utf8');
	const ssrManifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'vue-ssr-server-bundle.json'), 'utf8'));

	return createBundleRenderer(ssrManifest, {
		runInNewContext: false,
		template,
		cache: LRU({
			max: 100,
			maxAge: 1000,
		}),
	});
}

async function renderApp(ctx) {
	const context = {
		url: ctx.url.endsWith('?') ? ctx.url.slice(0, -1) : ctx.url, // It crashes otherwise
		hostname: ctx.hostname,
		protocol: 'http',
		apiHost: `127.0.0.1:${process.env.API_PORT}`,
		authCookie: ctx.cookies.get('auth'),
	};

	return await renderer.renderToStream(context);
}

let renderer = createAppRenderer();

const refreshRenderer = debounce(() => {
	renderer = createAppRenderer();
	logger.info('Refreshed app renderer');
}, 500);

fs.watch(path.join(__dirname, 'build', 'index.html'), refreshRenderer);
fs.watch(path.join(__dirname, 'build', 'vue-ssr-server-bundle.json'), refreshRenderer);

app.use(handler);
app.use(koaCompress({
	threshold: 2048,
	flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(koaConditional());
app.use(koaEtag());

app.use(loggerMiddleware);


// I am too lazy to split this code anywhere
app.use(async (ctx, next) => {
	const isStatic = ctx.origin.startsWith('http://static.') || ctx.origin.startsWith('https://static.');
	if (ctx.path === '/sitemap.xml' && !isStatic) {
		if (await helpers.isDdgBot(ctx.ip)
			|| await helpers.isGoogleBot(ctx.ip)
			|| await helpers.isBingBot(ctx.ip)) {
			const template = await fs.readFile('./public/sitemap.ejs', 'utf8');
			ctx.body = ejs.render(template, {
				snippets: await models.snippet.findAll(),
				users: await models.user.findAll(),
				absolute: relative => ctx.origin + relative,
			});
		}
	} else if (ctx.path === '/embed/search-badge' && !isStatic) {
		ctx.set('Content-Type', 'image/svg+xml');

		if (typeof(ctx.query.keywords) !== 'string' || !ctx.query.keywords)
			ctx.body = helpers.genBadge('Error', 'Missing keywords', '#f44336');
		else if (ctx.query.keywords.length < 3)
			ctx.body = helpers.genBadge('Error', 'Keywords too short', '#f44336');
		else {
			if (ctx.query.language) {
				const language = await models.language.findOne({where: {id: ctx.query.language}});
				if (!language) {
					ctx.body = helpers.genBadge('Error', 'Invalid language', '#f44336');
					return;
				}
			}

			let where = {
				[Sequelize.Op.or]: [
					{title:       {[Sequelize.Op.like]: '%' + ctx.query.keywords + '%'}},
					{description: {[Sequelize.Op.like]: '%' + ctx.query.keywords + '%'}},
				]
			};

			if (ctx.query.language)
				where.language_id = ctx.query.language;

			const snippetsCount = await models.snippet.count({
				where,
				limit: 10,
				include: [models.language, models.category, models.vote]
			});

			ctx.body = helpers.genBadge('CodeBottle', `${snippetsCount} snippets`, '#673ab7');
		}
	} else if (ctx.path === '/') {
		if (isStatic) {
			ctx.status = 404;
			ctx.body = 'Not found';
			logger.warn(`Access to main static URL by ${ctx.ip}`);
		} else {
			ctx.type = 'text/html; charset=utf-8';
			ctx.body = await renderApp(ctx);
		}
	} else if (ctx.path === '/index.ejs' || ctx.path === '/sitemap.ejs') {
		ctx.status = 404;
		ctx.body = 'Not found';
		logger.warn(`Access to .ejs file by ${ctx.ip}`);
	} else return next();
});

app.use(koaStatic('./public', {
	maxage: 1000 * 60 * 60 * 24 * 30,
}));

app.use(async (ctx, next) => {
	await next();
	const isStatic = ctx.origin.startsWith('http://static.') || ctx.origin.startsWith('https://static.');
	if (ctx.status === 404 && !isStatic) {
		ctx.type = 'text/html; charset=utf-8';
		ctx.body = await renderApp(ctx);
	}
});

module.exports = app;
