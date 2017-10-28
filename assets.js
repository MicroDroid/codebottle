require('dotenv').config();

const Koa = require('koa');
const app = new Koa();
const fs = require('fs');
const ejs = require('ejs');

const handler = require('./middleware/handler');
const loggerMiddleware = require('./middleware/logger');
const logger = require('./utils/logger');

const koaConditional = require('koa-conditional-get');
const koaEtag = require('koa-etag');
const koaStatic = require('koa-static');
const koaCompress = require('koa-compress');

app.use(handler);
app.use(koaCompress({
	threshold: 2048,
	flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(koaConditional());
app.use(koaEtag());

app.use(loggerMiddleware);

// Deny usage of static domain as main domain
app.use((ctx, next) => {
	if (ctx.url === '/') {
		if (ctx.origin.startsWith('http://static.') || ctx.origin.startsWith('https://static.')) {
			ctx.status = 404;
			ctx.body = 'Not found';
			logger.warn(`Access to main static URL by ${ctx.ip}`);
		} else {
			const template = fs.readFileSync('./public/index.ejs', 'utf8');
			const manifest = JSON.parse(fs.readFileSync('./public/webpack-manifest.json', 'utf8'));
			ctx.body = ejs.render(template, {
				js: manifest.js,
				css: manifest.css,
			});
		}
	} else if (ctx.url === '/index.ejs') {
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
	if (ctx.status === 404) {
		const template = fs.readFileSync('./public/index.ejs', 'utf8');
		const manifest = JSON.parse(fs.readFileSync('./public/webpack-manifest.json', 'utf8'));
		ctx.body = ejs.render(template, {
			js: '/' + manifest.js,
			css: '/' + manifest.css,
		});
	}
});

module.exports = app;
