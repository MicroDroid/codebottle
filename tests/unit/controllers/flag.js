require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const redis = require('../../../redis');
const ApiError = require('../../../errors/api-error');
const FlagController = require('../../../controllers/flag');
const models = require('../../../models');

chai.use(sinonChai);

describe('Flag controller', () => {
	it('Throws error when flagging with wrong params', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const findUserStub = this.stub(models.user, 'findOne');
		const redisGetStub = this.stub(redis, 'getAsync');
		const redisSetStub = this.stub(redis, 'setAsync');
		const createFlagStub = this.stub(models.flag, 'create');

		findSnippetStub.returns({
			id: 999,
		});
		findUserStub.returns({
			id: 999,
		});

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {},
			},
			state: {
				user: {
					id: 1
				}
			},
			params: {
				id: 'testid',
				username: 'testusername'
			}
		};

		await expect(FlagController.flagSnippet(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
		await expect(FlagController.flagUser(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(findUserStub, 'User should be queried').to.have.been.calledOnce;
		expect(redisGetStub, 'Redis should not be queried').to.not.have.been.called;
		expect(redisSetStub, 'Redis should not be modified').to.not.have.been.called;
		expect(createFlagStub, 'Flag should not be created').to.not.have.been.called;
	}));

	it('Throws error when flaggable is not found', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const findUserStub = this.stub(models.user, 'findOne');
		const redisGetStub = this.stub(redis, 'getAsync');
		const redisSetStub = this.stub(redis, 'setAsync');
		const createFlagStub = this.stub(models.flag, 'create');

		findSnippetStub.returns(null);
		findUserStub.returns(null);

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					description: 'description',
				},
			},
			state: {
				user: {
					id: 1,
				}
			},
			params: {
				id: 'testid',
				username: 'testusername'
			}
		};

		await expect(FlagController.flagSnippet(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
		await expect(FlagController.flagUser(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(findUserStub, 'User should be queried').to.have.been.calledOnce;
		expect(redisGetStub, 'Redis should not be queried').to.not.have.been.called;
		expect(redisSetStub, 'Redis should not be modified').to.not.have.been.called;
		expect(createFlagStub, 'Flag should not be created').to.not.have.been.called;
	}));

	it('Throws error when flagging owned entity', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const findUserStub = this.stub(models.user, 'findOne');
		const redisGetStub = this.stub(redis, 'getAsync');
		const redisSetStub = this.stub(redis, 'setAsync');
		const createFlagStub = this.stub(models.flag, 'create');

		findSnippetStub.returns({
			user_id: 1
		});
		findUserStub.returns({
			id: 1
		});

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					description: 'description',
				},
			},
			state: {
				user: {
					id: 1,
				}
			},
			params: {
				id: 'testid',
				username: 'testusername'
			}
		};

		await expect(FlagController.flagSnippet(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
		await expect(FlagController.flagUser(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(findUserStub, 'User should be queried').to.have.been.calledOnce;
		expect(redisGetStub, 'Redis should not be queried').to.not.have.been.called;
		expect(redisSetStub, 'Redis should not be modified').to.not.have.been.called;
		expect(createFlagStub, 'Flag should not be created').to.not.have.been.called;
	}));

	it('Throttles flagging', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const findUserStub = this.stub(models.user, 'findOne');
		const redisGetStub = this.stub(redis, 'getAsync');
		const redisSetStub = this.stub(redis, 'setAsync');
		const createFlagStub = this.stub(models.flag, 'create');

		findSnippetStub.returns({
			user_id: 999
		});
		findUserStub.returns({
			id: 999
		});

		redisGetStub.returns(1);

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					description: 'description',
				},
			},
			state: {
				user: {
					id: 1,
				}
			},
			params: {
				id: 'testid',
				username: 'testusername'
			}
		};

		await expect(FlagController.flagSnippet(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
		await expect(FlagController.flagUser(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(findUserStub, 'User should be queried').to.have.been.calledOnce;
		expect(redisGetStub, 'Redis should be queried').to.have.been.calledTwice;
		expect(redisSetStub, 'Redis should not be modified').to.not.have.been.called;
		expect(createFlagStub, 'Flag should not be created').to.not.have.been.called;
	}));

	it('Flags', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const findUserStub = this.stub(models.user, 'findOne');
		const redisGetStub = this.stub(redis, 'getAsync');
		const redisSetStub = this.stub(redis, 'setAsync');
		const createFlagStub = this.stub(models.flag, 'create');

		findSnippetStub.returns({
			user_id: 999
		});
		findUserStub.returns({
			id: 999
		});

		redisGetStub.returns(null);

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					description: 'description',
				},
			},
			state: {
				user: {
					id: 1,
				}
			},
			params: {
				id: 'testid',
				username: 'testusername'
			}
		};

		await expect(FlagController.flagSnippet(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;
		await expect(FlagController.flagUser(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(findUserStub, 'User should be queried').to.have.been.calledOnce;
		expect(redisGetStub, 'Redis should be queried').to.have.been.calledTwice;
		expect(redisSetStub, 'Redis should be modified').to.have.been.calledTwice;
		expect(createFlagStub, 'Two flags should be created').to.have.been.calledTwice;;
	}));
});
