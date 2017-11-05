require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const ApiError = require('../../../errors/api-error');
const VoteController = require('../../../controllers/vote');
const models = require('../../../models');

chai.use(sinonChai);

describe('Vote controller', () => {
	const snippet = {
		id: 1,
		public_id: 'abcde12345',
		title: 'Test title',
		description: 'Test description',
		code: 'Test code',
		views: 30,
		created_at: (new Date()).toISOString(),
		updated_at: (new Date()).toISOString(),
	};

	const overcoder = {
		id: 1,
		username: 'OverCoder',
		email: 'some@email.com',
		banned: false,
		activated: true
	};

	it('Throws error on invalid parameters when voting', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const voteUpsertStub = this.stub(models.vote, 'upsert');

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {},
			},
			state: {
				user: overcoder,
			},
			params: {},
		};

		await expect(VoteController.vote(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findSnippetStub, 'Snippet should not be queried').to.have.not.been.called;

		ctx.params.snippet = 1;
		ctx.request.body.vote = 1;

		await expect(VoteController.vote(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(voteUpsertStub, 'Vote should never be upserted').to.have.not.been.called;
	}));

	it('Throw error when voting for owned snippet', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const voteUpsertStub = this.stub(models.vote, 'upsert');

		findSnippetStub.returns({
			...snippet,
			user_id: overcoder.id,
		});

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					vote: 1,
				},
			},
			state: {
				user: overcoder,
			},
			params: {
				snippet: snippet.id,
			},
		};

		await expect(VoteController.vote(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(voteUpsertStub, 'Vote should not be upserted').to.not.have.been.called;
	}));

	it('Stores votes', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const voteUpsertStub = this.stub(models.vote, 'upsert');

		findSnippetStub.returns({
			...snippet,
			user_id: 999,
		});

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					vote: 1,
				},
			},
			state: {
				user: overcoder,
			},
			params: {
				snippet: snippet.id,
			},
		};

		await expect(VoteController.vote(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(voteUpsertStub, 'Vote should be upserted').to.have.been.called;
	}));

	it('Stores vote as 0, 1, or -1 only', sinonTest(async function () {
		const findSnippetStub = this.stub(models.snippet, 'findOne');
		const voteUpsertStub = this.stub(models.vote, 'upsert');

		findSnippetStub.returns({
			...snippet,
			user_id: 999,
		});

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					vote: 2,
				},
			},
			state: {
				user: overcoder,
			},
			params: {
				snippet: snippet.id,
			},
		};

		await expect(VoteController.vote(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledOnce;
		expect(voteUpsertStub, 'Vote should be upserted').to.have.been.calledOnce;
		expect(voteUpsertStub.getCall(0).args[0].vote).to.equal(1);

		ctx.request.body.vote = -2;

		await expect(VoteController.vote(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(findSnippetStub, 'Snippet should be queried').to.have.been.calledTwice;
		expect(voteUpsertStub, 'Vote should be upserted').to.have.been.calledTwice;
		expect(voteUpsertStub.getCall(1).args[0].vote).to.equal(-1);
	}));
});
