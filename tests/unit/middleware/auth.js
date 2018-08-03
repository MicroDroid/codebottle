require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const cryptojs = require('crypto-js');
const ApiError = require('../../../errors/api-error');
const auth = require('../../../middleware/auth');
const models = require('../../../models');

chai.use(sinonChai);

describe('Auth middleware', () => {
	const overcoder = {
		username: 'OverCoder',
		bio: 'Enthusiastic developer',
	};

	it('Does nothing if there is no JWT and passthrough is on', sinonTest(async function() {
		let ctx = {
			status: 200,
			body: {},
			state: {}
		};

		const authInstance = auth(true);
		await expect(authInstance(ctx, () => {}), 'Auth should not throw error')
			.to.eventually.be.fulfilled;

		expect(ctx.state.user, 'User should stay undefined').to.be.undefined;
	}));

	it('Throws error without JWT and passthrough is off', sinonTest(async function () {
		let ctx = {
			status: 200,
			body: {},
			state: {}
		};

		const authInstance = auth(false);
		await expect(authInstance(ctx, () => {}), 'Auth should not throw error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Throws error with invalid JWT and passthrough off', sinonTest(async function() {
		const findOneStub = this.stub(models.user, 'findOne');
		findOneStub.returns(null);

		let ctx = {
			state: {
				user: {
					id: 1
				}
			}
		};

		let authInstance = auth();
		await expect(authInstance(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Does not throw error with invalid JWT and passthrough on', sinonTest(async function () {
		const findOneStub = this.stub(models.user, 'findOne');
		findOneStub.returns(null);

		let ctx = {
			state: {
				user: {
					id: 1
				}
			}
		};

		let authInstance = auth(true);
		await expect(authInstance(ctx, () => {}), 'Should not throw error')
			.to.eventually.be.fulfilled;

		expect(ctx.state.user, 'User should be set to undefined').to.be.undefined;
	}));

	it('Throws error when privates don\'t match and passthrough off', sinonTest(async function() {
		const findOneStub = this.stub(models.user, 'findOne');
		findOneStub.returns(overcoder);

		let ctx = {
			state: {
				user: {
					id: 1,
					priv: 'blah',
				}
			}
		};

		let authInstance = auth();
		return expect(authInstance(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Does not throw error when privates don\'t match and passthrough on', sinonTest(async function() {
		const findOneStub = this.stub(models.user, 'findOne');
		findOneStub.returns(overcoder);

		let ctx = {
			state: {
				user: {
					id: 1,
					priv: 'blah',
				}
			}
		};

		let authInstance = auth(true);
		await expect(authInstance(ctx, () => {}), 'Should not throw error')
			.to.eventually.be.fulfilled;
			
		expect(ctx.state.user, 'User should be set to undefined').to.be.undefined;
	}));

	it('Sets user if correct', sinonTest(async function() {
		const findOneStub = this.stub(models.user, 'findOne');
		const sha256Stub = this.stub(cryptojs, 'SHA256');

		const priv = 'some_priv';

		findOneStub.returns(overcoder);
		sha256Stub.returns(priv);

		const user = {
			id: 1,
			priv,
		};

		let ctx = {
			state: {user}
		};

		let authInstance = auth();
		await expect(authInstance(ctx, () => {}), 'Should not throw error')
			.to.eventually.be.fulfilled;

		expect(ctx.state.user, 'User should be set properly').to.deep.equal(overcoder);

		// Reset user
		ctx.state.user = user;

		authInstance = auth(true);
		await expect(authInstance(ctx, () => {}), 'Should not throw error')
			.to.eventually.be.fulfilled;

		expect(ctx.state.user, 'User should be set properly').to.deep.equal(overcoder);
	}));
});