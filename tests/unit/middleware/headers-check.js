const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const ApiError = require('../../../errors/api-error');
const headersCheck = require('../../../middleware/headers-check');

chai.use(sinonChai);

describe('Headers check middleware', () => {
	it('Rejects wrong API versions', sinonTest(async function() {
		let ctx = {
			status: 200,
			body: {}
		};
		ctx.get = () => {};
		const getStub = this.stub(ctx, 'get');
		getStub.withArgs('Accept').returns('application/vnd.codebottle.v9+json');

		return expect(headersCheck(ctx, () => {}), 'Headers check should throw an API error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Rejects wrong accept headers', sinonTest(async function() {
		let ctx = {
			status: 200,
			body: {}
		};
		ctx.get = () => {};
		const getStub = this.stub(ctx, 'get');
		getStub.withArgs('Accept').returns('application/json');

		return expect(headersCheck(ctx, () => {}), 'Headers check should throw an API error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Passes on correct headers', sinonTest(async function() {
		let ctx = {
			status: 200,
			body: {}
		};
		ctx.get = () => {};
		const getStub = this.stub(ctx, 'get');
		getStub.withArgs('Accept').returns('application/vnd.codebottle.v1+json');

		await headersCheck(ctx, () => {});

		expect(getStub, 'Accept header should be queried').to.have.been.calledOnce;
		expect(ctx.status, 'Status code should be unchanged').to.equal(200);
		expect(ctx.body, 'Body should remain the same').to.deep.equal({});
	}));
});