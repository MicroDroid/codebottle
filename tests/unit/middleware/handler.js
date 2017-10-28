const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const ApiError = require('../../../errors/api-error');
const RateLimitError = require('../../../errors/rate-limit-error');
const handler = require('../../../middleware/handler');

chai.use(sinonChai);

describe('Handler middleware', () => {
	it('Catches and logs errors', sinonTest(async function() {
		const error = new TypeError('error!');
		let ctx = {};

		const consoleStub = this.stub(console, 'log');

		await handler(ctx, async () => {
			throw error;
		});

		expect(ctx.status, 'Status should be 500').to.equal(500);
		expect(ctx.body.error, 'Error should be \'Internal error\'').to.equal('Internal error');
		expect(consoleStub, 'Should log to console').to.have.been.calledWith(error);
	}));

	it('Customizes error message for 401', sinonTest(async function() {
		let error = new TypeError('error!');
		error.status = 401;

		let ctx = {};

		await handler(ctx, async () => {
			throw error;
		});

		expect(ctx.status, 'Status should be 401').to.equal(401);
		expect(ctx.body.error, 'Error should be \'Authenticated required\'').to.equal('Authentication required');
	}));

	it('Customizes error message for 404', sinonTest(async function() {
		let ctx = {};

		await handler(ctx, async () => {
			ctx.status = 404;
		});

		expect(ctx.status, 'Status should be 404').to.equal(404);
		expect(ctx.body.error, 'Error should be \'Not found\'').to.equal('Not found');

		ctx.status = 404;

		await handler(ctx, () => {});

		expect(ctx.status, 'Status should be 404').to.equal(404);
		expect(ctx.body.error, 'Error should be \'Not found\'').to.equal('Not found');
	}));

	it('Formats ApiError properly', sinonTest(async function() {
		let error = new ApiError(422, 'Invalid field!');

		let ctx = {};

		await handler(ctx, async function() {
			throw error;
		});

		expect(ctx.status, `Status should be ${error.status}`).to.equal(error.status);
		expect(ctx.body.error, `Error should be '${error.message}'`).to.equal(error.message);
	}));

	it('Formats RateLimitError properly', sinonTest(async function() {
		let error = new RateLimitError();

		let ctx = {};

		await handler(ctx, async () => {
			throw error;
		});

		expect(ctx.status, 'Status should be 429').to.equal(429);
		expect(ctx.body.error, 'Error should be \'Too many requests\'').to.equal('Too many requests');
	}));

	it('Does nothing on no errors', sinonTest(async function() {
		let ctx = {
			status: 201,
			body: {
				message: 'Created!',
			}
		};

		await handler(ctx, async () => {});

		expect(ctx.status, 'Status should remain the same').to.equal(201);
		expect(ctx.body, 'Body should remain the same').to.deep.equal({
			message: 'Created!',
		});
	}));
});
