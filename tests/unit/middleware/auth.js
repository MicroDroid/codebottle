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

	it('Does nothing if there is no JWT', sinonTest(async function() {
		let ctx = {
			status: 200,
			body: {},
			state: {}
		};

		let authInstance = auth();
		await authInstance(ctx, () => {});

		expect(ctx.body, 'Body should remain the same').to.deep.equal({});
		expect(ctx.status, 'Status should remain the same').to.equal(200);
		expect(ctx.state.user, 'User should stay null').to.be.undefined;

		authInstance = auth(true);
		await authInstance(ctx, () => {});

		expect(ctx.body, 'Body should remain the same').to.deep.equal({});
		expect(ctx.status, 'Status should remain the same').to.equal(200);
		expect(ctx.state.user, 'User should stay null').to.be.undefined;
	}));

	it('Throws error when JWT doesn\'t resolve to a user without passthrough', sinonTest(async function() {
		const findOneStub = this.stub(models.user, 'findOne');
		findOneStub.returns(null);

		let ctx = {
			state: {
				user: {id: 1}
			}
		};

		let authInstance = auth();
		expect(authInstance(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Throws error when privates don\'t match without passthrough', sinonTest(async function() {
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

	it('Does not throw error when JWT doesn\'t resolve to a user with passthrough', sinonTest(async function() {
		const findOneStub = this.stub(models.user, 'findOne');
		findOneStub.returns(null);

		let ctx = {
			state: {
				user: {id: 1}
			}
		};

		let authInstance = auth(true);
		await expect(authInstance(ctx, () => {}), 'Should not throw error')
			.to.eventually.be.fulfilled
			.then(() => {
				expect(ctx.state.user, 'User should be set to null').to.be.null;
			});
	}));

	it('Does not throw error when privates don\'t match with passthrough', sinonTest(async function() {
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
		return expect(authInstance(ctx, () => {}), 'Should not throw error')
			.to.eventually.be.fulfilled
			.then(() => {
				expect(ctx.state.user, 'User should be set to null').to.be.null;
			});
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
		return expect(authInstance(ctx, () => {}), 'Should not throw error')
			.to.eventually.be.fulfilled
			.then(() => {
				expect(ctx.state.user, 'User should be set properly').to.deep.equal(overcoder);
				ctx.state.user = user;
				const authInstance = auth(true);
				return expect(authInstance(ctx, () => {}), 'Should not throw error')
					.to.eventually.be.fulfilled
					.then(() => {
						expect(ctx.state.user, 'User should be set properly').to.deep.equal(overcoder);
					});
			});
	}));
});