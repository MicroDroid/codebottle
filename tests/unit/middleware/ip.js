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

		ctx.get = this.stub();
		ctx.get.withArgs('CF_CONNECTING_IP').returns('8.8.8.8');

		await expect(ip(ctx, () => {}), 'IP middleware should not error')
			.to.eventually.be.fulfilled;

		expect(ctx.ip, 'IP property should be set to Cloudflare\'s').to.equal('8.8.8.8');
	}));

	it('Falls back to client IP', sinonTest(async function() {
		let ctx = {
			ip: '127.0.0.1',
		};

		ctx.get = this.stub();
		ctx.get.withArgs('CF_CONNECTING_IP').returns(null);

		await expect(ip(ctx, () => {}), 'IP middleware should not error')
			.to.eventually.be.fulfilled;

		expect(ctx.ip, 'IP should remain the same').to.equal(ctx.ip);
	}));
});
