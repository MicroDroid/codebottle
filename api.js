const Koa = require('koa');
const headersCheck = require('./middleware/headers-check');
const handler = require('./middleware/handler');
const logger = require('./middleware/logger')('api');
const cors = require('koa2-cors');
const koaBody = require('koa-body');

const koaConditional = require('koa-conditional-get');
const koaEtag = require('koa-etag');
const koaCompress = require('koa-compress');

const app = new Koa();
const router = require('./router')(app);

app
	.use(handler)
	.use(logger)
	.use(koaCompress({
		threshold: 2048,
		flush: require('zlib').Z_SYNC_FLUSH
	}))
	.use(koaConditional())
	.use(koaEtag())
	.use(cors({
		origin: '*',
		maxAge: 864000, // 10d
		allowHeaders: ['Authorization', 'Accept', 'Content-Type'],
	}))
	.use(headersCheck)
	.use(koaBody())
	.use(router.routes())
	.use(router.allowedMethods());

module.exports = app;
