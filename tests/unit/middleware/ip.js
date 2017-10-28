const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const ip = require('../../../middleware/ip');

chai.use(sinonChai);

describe('IP middleware', () => {
	it('Prefers Cloudflare\'s IP', sinonTest(async function() {
		let ctx = {
			ip: '127.0.0.1',
		};

		ctx.get = () => {}; // idk what would I else do

		const getStub = this.stub(ctx, 'get');

		getStub.withArgs('CF_CONNECTING_IP').returns('8.8.8.8');

		await ip(ctx, () => {});

		expect(ctx.ip, 'IP property should be set to Cloudflare\'s').to.equal('8.8.8.8');
	}));

	it('Falls back to client IP', sinonTest(async function() {
		let ctx = {
			ip: '127.0.0.1',
		};

		ctx.get = () => {};

		const getStub = this.stub(ctx, 'get');

		getStub.withArgs('CF_CONNECTING_IP').returns(null);

		await ip(ctx, () => {});

		expect(ctx.ip, 'IP should remain the same').to.equal(ctx.ip);
	}));
});
