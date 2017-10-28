require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const ApiError = require('../../../errors/api-error');
const LanguageController = require('../../../controllers/language');
const models = require('../../../models');

chai.use(sinonChai);

describe('Language controller', () => {
	const languages = [
		{
			id: 1,
			name: 'Java'
		},
		{
			id: 2,
			name: 'C/C++'
		},
		{
			id: 3,
			name: 'C#'
		},
	];

	it('Gets all languages', sinonTest(async function() {
		const findAllStub = this.stub(models.language, 'findAll');
		findAllStub.returns(languages);

		let ctx = {
			status: 200,
			body: {},
		};

		await expect(LanguageController.getAll(ctx, () => {}), 'Getting all languages should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should remain the same').to.equal(200);
		expect(ctx.body, 'Languages should be returned').to.deep.equal(languages);
	}));

	it('Throws error when getting all languages of empty DB', sinonTest(async function() {
		const findAllStub = this.stub(models.language, 'findAll');
		findAllStub.returns([]);

		let ctx = {
			status: 200,
			body: {},
		};

		expect(LanguageController.getAll(ctx, () => {}), 'Error should be thrown')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Gets a single language', sinonTest(async function() {
		const findOne = this.stub(models.language, 'findOne');
		findOne.returns(languages[0]);

		let ctx = {
			status: 200,
			body: {},
			params: {id: 1},
		};

		await expect(LanguageController.get(ctx, () => {}), 'Getting a language should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should remain the same').to.equal(200);
		expect(ctx.body, 'The language should be returned').to.deep.equal(languages[0]);
	}));

	it('Throws error when getting invalid language', sinonTest(async function() {
		const findOne = this.stub(models.language, 'findOne');
		findOne.returns(null);

		let ctx = {
			status: 200,
			body: {},
			params: {id: 1},
		};

		return expect(LanguageController.get(ctx, () => {}), 'Error should be thrown')
			.to.eventually.be.rejectedWith(ApiError);
	}));
});
