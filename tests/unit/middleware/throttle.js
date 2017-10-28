const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const chaiAsPromised = require('chai-as-promised');
const redis = require('../../../redis');
const RateLimitError = require('../../../errors/rate-limit-error');
const throttle = require('../../../middleware/throttle');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Throttle middleware', () => {
	let getAsyncStub = null;
	let setAsyncStub = null;

	beforeEach(() => {
		getAsyncStub = sinon.stub(redis, 'getAsync');
		setAsyncStub = sinon.stub(redis, 'setAsync');
	});

	afterEach(() => {
		getAsyncStub.restore();
		setAsyncStub.restore();
	});

	it('Throws error on exceeding limit', sinonTest(async function() {
		getAsyncStub.returns(JSON.stringify({
			requests: 5,
		}));

		let ctx = {
			status: 200,
		};

		let throttleInstance = throttle(5, 60);

		await expect(throttleInstance(ctx, () => {}), 'Should throw RateLimitError')
			.to.eventually.be.rejectedWith(RateLimitError);

		throttleInstance = throttle(5, 60, true);

		await expect(throttleInstance(ctx, () => {}), 'Should throw RateLimitError')
			.to.eventually.be.rejectedWith(RateLimitError);

		expect(getAsyncStub, 'Throttling data should be queried twice').to.have.been.calledTwice;
		expect(setAsyncStub, 'Throttling data should not be updated').to.not.have.been.calledOnce;
	}));

	it('Passes when not exceeding limit', sinonTest(async function() {
		getAsyncStub.returns(JSON.stringify({
			requests: 5,
		}));

		let ctx = {
			status: 200,
		};

		let throttleInstance = throttle(60, 60);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		throttleInstance = throttle(60, 60, true);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		expect(setAsyncStub, 'Throttling data should be updated twice').to.have.been.calledTwice;
		expect(getAsyncStub, 'Throttling data should be queried twice').to.have.been.calledTwice;
	}));

	it('Passes when no backlogs exist', sinonTest(async function() {
		getAsyncStub.returns(null);

		let ctx = {
			status: 200,
		};

		let throttleInstance = throttle(60, 60);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		throttleInstance = throttle(60, 60, true);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		ctx.status = 422;

		throttleInstance = throttle(60, 60);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		throttleInstance = throttle(60, 60, true);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		expect(getAsyncStub, 'Throttling data should be queried four times').to.have.been.callCount(4);
		expect(setAsyncStub, 'Throttling data should be created three times').to.have.been.callCount(3);
	}));

	it('Stores requests count', sinonTest(async function() {
		getAsyncStub.returns(null);

		let ctx = {
			status: 200,
		};

		let throttleInstance = throttle(60, 60);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		throttleInstance = throttle(60, 60, true);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		expect(getAsyncStub, 'Throttling data should be queried twice')
			.to.have.been.calledTwice;
		expect(setAsyncStub, 'Throttling data should be set twice')
			.to.have.been.calledTwice;
	}));

	it('It does not update count on error with success only flag', sinonTest(async function () {
		getAsyncStub.returns(null);

		let ctx = {
			status: 422,
		};

		let throttleInstance = throttle(60, 60, true);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		getAsyncStub.returns(JSON.stringify({
			requests: 2
		}));

		throttleInstance = throttle(60, 60, true);

		await expect(throttleInstance(ctx, () => {}), 'Should not throw any error')
			.to.eventually.be.fulfilled;

		expect(getAsyncStub, 'Throttling data should be queried twice')
			.to.have.been.calledTwice;
		expect(setAsyncStub, 'Throttling data should not be set')
			.to.have.not.been.called;
	}));
});
