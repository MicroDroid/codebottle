require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const redis = require('../../../redis');
const _ = require('lodash');
const ApiError = require('../../../errors/api-error');
const SnippetController = require('../../../controllers/snippet');
const models = require('../../../models');
const helpers = require('../../../helpers');
const crypto = require('crypto');

chai.use(sinonChai);


describe('Snippet controller', () => {
	// I am not sure if it is the best to store objects like this and
	// then use them later in the tests, so please don't blame me
	// if that looks any ugly.
	//
	// Probably collapse these in your editor, too

	const overcoder = {
		id: 1,
		username: 'OverCoder',
		email: 'yousef.su.2000@gmail.com',
		banned: false,
		activated: true
	};

	const category = {
		id: 1,
		name: 'Function',
	};

	const language = {
		id: 1,
		name: 'JavaScript',
	};
	
	const snippets = [
		{
			id: 1,
			public_id: 'abcde12345',
			title: 'Unique title',
			description: 'Test description',
			code: 'Test code',
			views: 30,
			created_at: (new Date()).toISOString(),
			updated_at: (new Date()).toISOString(),
			votes: [{
				id: 1,
				user_id: overcoder.id,
				snippet_id: 1,
				vote: 1,
			}],
			category, language,
		},
		{
			id: 2,
			public_id: 'abcde12346',
			title: 'Test title',
			description: 'Unique description',
			code: 'Test code',
			views: 30,
			created_at: (new Date()).toISOString(),
			updated_at: (new Date()).toISOString(),
			votes: [{
				id: 2,
				user_id: overcoder.id,
				snippet_id: 2,
				vote: -1,
			}],
			category, language,
		},
	];

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

	const votes = [
		{
			id: 1,
			user_id: overcoder.id,
			snippet_id: snippet.id,
			vote: 1,
		},
	];

	it('Gets a snippet', sinonTest(async function () {
		const findOneStub = this.stub(models.snippet, 'findOne');
		const getAsyncStub = this.stub(redis, 'getAsync');
		getAsyncStub.returns(1);

		findOneStub.returns({
			...snippet,
			language, category, votes
		});

		let ctx = {
			status: 200,
			params: {
				id: snippet.public_id
			},
			state: {},
		};

		await expect(SnippetController.get(ctx, () => {}), 'Getting a snippet should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status ,'Status should be 200').to.equal(200);
		expect(ctx.body, 'Snippet should be returned').to.deep.equal({
			..._.omit(snippet, 'public_id', 'updated_at' ,'created_at'),
			id: snippet.public_id,
			votes: votes.reduce((p, c) => p + c.vote, 0),
			createdAt: snippet.created_at,
			updatedAt: snippet.updated_at,
			language, category,
		});
	}));

	it('Getting a snippet increments views', sinonTest(async function () {
		const findOneStub = this.stub(models.snippet, 'findOne');
		const incrementStub = this.stub();
		const getAsyncStub = this.stub(redis, 'getAsync');
		const setAsyncStub = this.stub(redis, 'setAsync');
		getAsyncStub.returns(null);

		findOneStub.returns({
			...snippet,
			language, category, votes,
			increment: incrementStub,
		});

		let ctx = {
			status: 200,
			params: {
				id: snippet.public_id
			},
			state: {},
		};

		await expect(SnippetController.get(ctx, () => {}), 'Getting a snippet should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(incrementStub, 'View count should be incremented').to.be.calledWith('views', {silent: true});
		expect(setAsyncStub, 'View cache should be set in redis').to.be.calledOnce;
		expect(ctx.status ,'Status should be 200').to.equal(200);
		expect(ctx.body, 'Snippet should be returned').to.deep.equal({
			..._.omit(snippet, 'public_id', 'views', 'updated_at', 'created_at'),
			id: snippet.public_id,
			votes: votes.reduce((p, c) => p + c.vote, 0),
			views: snippet.views + 1,
			createdAt: snippet.created_at,
			updatedAt: snippet.updated_at,
			language, category,
		});
	}));

	it('Adds current vote when getting snippet while authed', sinonTest(async function () {
		const findOneStub = this.stub(models.snippet, 'findOne');
		const getAsyncStub = this.stub(redis, 'getAsync');
		getAsyncStub.returns(1);

		findOneStub.returns({
			...snippet,
			language, category, votes
		});

		let ctx = {
			status: 200,
			params: {
				id: snippet.public_id
			},
			state: {
				user: {
					getVotes: () => votes,
				}
			}
		};

		await expect(SnippetController.get(ctx, () => {}), 'Getting a snippet should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be 200').to.equal(200);
		expect(ctx.body, 'Snippet including current vote should be returned').to.deep.equal({
			..._.omit(snippet, 'public_id', 'updated_at', 'created_at'),
			id: snippet.public_id,
			votes: votes.reduce((p, c) => p + c.vote, 0),
			currentVote: votes[0].vote,
			updatedAt: snippet.updated_at,
			createdAt: snippet.created_at,
			language, category,
		});

		ctx.state.user.getVotes = () => [];

		await expect(SnippetController.get(ctx, () => {}), 'Getting a snippet should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be 200').to.equal(200);
		expect(ctx.body, 'Snippet including current vote should be returned').to.deep.equal({
			..._.omit(snippet, 'public_id', 'updated_at', 'created_at'),
			id: snippet.public_id,
			votes: votes.reduce((p, c) => p + c.vote, 0),
			currentVote: 0,
			updatedAt: snippet.updated_at,
			createdAt: snippet.created_at,
			language, category,
		});
	}));

	it('Throws error when snippet does not exist', sinonTest(async function () {
		const findOneStub = this.stub(models.snippet, 'findOne');
		findOneStub.returns(null);

		let ctx = {
			status: 200,
			params: {
				id: 'test',
			},
		};

		await expect(SnippetController.get(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		ctx = {
			status: 200,
			params: {
				id: 'test',
			},
			overcoder
		};

		return expect(SnippetController.get(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Throws error when searching invalid parameters', sinonTest(async function () {
		const attempt = (query) => {
			let ctx = {
				status: 200,
				body: {},
				query
			};

			return expect(SnippetController.search(ctx, () => {}), 'Should throw error')
				.to.eventually.be.rejectedWith(ApiError);
		};

		await attempt({                             });
		await attempt({                 language:  1});
		await attempt({                 language: -1});
		await attempt({keywords: 'a'  ,             });
		await attempt({keywords: 'a'  , language:  1});
		await attempt({keywords: 'a'  , language: -1});
		await attempt({keywords: 'ab' ,             });
		await attempt({keywords: 'ab' , language:  1});
		await attempt({keywords: 'ab' , language: -1});

		const findOneStub = this.stub(models.language, 'findOne');
		findOneStub.returns(null);

		await attempt({keywords: 'abc', language: -1});
	}));

	it('Searches snippets', sinonTest(async function () {
		const findAllStub = this.stub(models.snippet, 'findAll');
		const findOneStub = this.stub(models.language, 'findOne');
		findOneStub.returns(language);
		findAllStub.returns(snippets);

		let ctx = {
			status: 200,
			body: {},
			query: {
				keywords: 'test stuff',
			}
		};

		await expect(SnippetController.search(ctx, () => {}), 'Searching snippets should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be 200').to.equal(200);
		expect(ctx.body.length, 'All matching snippets should be returned').to.equal(snippets.length);


		for (let i = 0; i < ctx.body.length; i++) {
			expect(ctx.body[i]).to.deep.equal({
				..._.omit(snippets[i], 'public_id', 'votes', 'created_at', 'updated_at'),
				id: snippets[i].public_id,
				createdAt: snippets[i].created_at,
				updatedAt: snippets[i].updated_at,
				votes: snippets[i].votes.reduce((p, c) => p + c.vote, 0)
			}, 'Snippet should match schema');
		}

		// Test it works with setting a language, too

		ctx.query.language = language.id;

		await expect(SnippetController.search(ctx, () => {}), 'Searching snippets should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be 200').to.equal(200);

		for (let i = 0; i < ctx.body.length; i++) {
			expect(ctx.body[i]).to.deep.equal({
				..._.omit(snippets[i], 'public_id', 'votes', 'updated_at', 'created_at'),
				id: snippets[i].public_id,
				updatedAt: snippet.updated_at,
				createdAt: snippet.created_at,
				votes: snippets[i].votes.reduce((p, c) => p + c.vote, 0)
			}, 'Snippet should match schema');
		}

		expect(findAllStub, 'Snippets should be searched twice').to.be.calledTwice;
	}));

	it('Gets new snippets', sinonTest(async function () {
		const findAllStub = this.stub(models.snippet, 'findAll');
		findAllStub.returns(snippets);

		let ctx = {
			status: 200,
			body: {},
		};

		await expect(SnippetController.getNew(ctx, () => {}), 'Getting new snippets should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be 200').to.equal(200);

		for (var i = 0; i < ctx.body.length; i++) {
			expect(ctx.body[i]).to.deep.equal({
				..._.omit(snippets[i], 'public_id', 'votes', 'created_at', 'updated_at'),
				id: snippets[i].public_id,
				createdAt: snippet.created_at,
				updatedAt: snippet.updated_at,
				votes: snippets[i].votes.reduce((p, c) => p + c.vote, 0)
			}, 'Snippet should match schema');
		}
	}));

	it('Routes correctly when reaching index', sinonTest(async function () {
		const searchStub = this.stub(SnippetController, 'search');
		const getNewStub = this.stub(SnippetController, 'getNew');

		let ctx = {
			status: 200,
			body: {},
			query: {
				keywords: 'a',
			}
		};

		await expect(SnippetController.index(ctx, () => {}), 'Call to index should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should not be changed').to.equal(200);
		expect(ctx.body, 'Body should not be changed').to.deep.equal({});
		expect(searchStub, 'It should search').to.be.called;
		expect(getNewStub, 'It should not get new snippets').to.be.not.called;

		ctx.query = {};

		await expect(SnippetController.index(ctx, () => {}), 'Call to index should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should not be changed').to.equal(200);
		expect(ctx.body, 'Body should not be changed').to.deep.equal({});
		expect(searchStub, 'It should not search').to.be.not.calledTwice;
		expect(getNewStub, 'It should get new snippets').to.be.called;
	}));

	it('Throws an error on creating snippet with invalid params', sinonTest(async function () {
		const findLangaugeStub = this.stub(models.language, 'findOne');
		const findCategoryStub = this.stub(models.category, 'findOne');
		const createSnippetStub = this.stub(models.snippet, 'create');
		const transformSnippetsStub = this.stub(models.snippet, 'transform');

		const attempt = (body) => {
			if (body.category && body.category > 0)
				findCategoryStub.returns(category);
			else findCategoryStub.returns(null);

			if (body.language && body.language > 0)
				findLangaugeStub.returns(language);
			else findLangaugeStub.returns(null);

			let ctx = {
				status: 200,
				body: {},
				request: {
					body,
				},
				state: {
					user: overcoder,
				}
			};

			return expect(SnippetController.create(ctx, () => {}), 'Should throw error')
				.to.eventually.be.rejectedWith(ApiError);
		};

		const combinations = helpers.generateCombinations({
			title: [
				undefined,
				'This is a very good title that fits the length limits',
				'short',
				'long'.repeat(18), // 72 characters
			],
			code: [
				undefined,
				'console.log(\'ES6 ftw!\');'
			],
			description: [
				undefined,
				'Some whatever description',
			],
			language: [
				undefined,
				1,
				-1,
			],
			category: [
				undefined,
				1,
				-1,
			]
		}).filter(combination => { // Filter out valid combinations
			return !(combination.title
				&& combination.title.length > 20
				&& combination.title.length < 70
				&& combination.code
				&& combination.language === 1
				&& combination.category === 1);
		});

		for (let combination of combinations)
			await attempt(combination);

		expect(createSnippetStub, 'Snippet should not be created').to.not.have.been.called;
		expect(transformSnippetsStub, 'Snippet should not be transformed').to.not.have.been.called;
	}));

	it('Creates snippets', sinonTest(async function () {
		const findLangaugeStub = this.stub(models.language, 'findOne');
		const findCategoryStub = this.stub(models.category, 'findOne');
		const createSnippetStub = this.stub(models.snippet, 'create');
		const snippetReloadStub = this.stub();
		const transformSnippetsStub = this.stub(models.snippet, 'transform');
		const cryptoStub = this.stub(crypto, 'randomBytes');

		const id = 'abcde12345';

		let input = {
			title: 'This is a very good title that fits the length limits',
			code: 'console.log(\'ES6 ftw!\');',
			language: 1,
			category: 1,
		};

		let snippet = {
			...input,
			public_id: id,
			user_id: overcoder.id,
			reload: snippetReloadStub,
		};

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: input,
			},
			state: {
				user: overcoder,
			}
		};

		findCategoryStub.returns(category);
		findLangaugeStub.returns(language);
		cryptoStub.returns(id);
		createSnippetStub.returns(snippet);
		transformSnippetsStub.returns(snippet);

		await expect(SnippetController.create(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(snippetReloadStub, 'Snippet should be reloaded').to.have.been.calledOnce;
		expect(createSnippetStub, 'Snippet should be created').to.have.been.calledOnce;
		expect(transformSnippetsStub, 'Snippet should be transformed').to.have.been.calledOnce;
		expect(ctx.body, 'Output snippet data should be same as input').to.deep.equal(snippet);
	}));
});
