require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const ApiError = require('../../../errors/api-error');
const CategoryController = require('../../../controllers/category');
const models = require('../../../models');

chai.use(sinonChai);

describe('Category controller', () => {
	const categories = [
		{
			id: 1,
			name: 'Function',
		},
		{
			id: 2,
			name: 'Class',
		}
	];

	it('Gets all categories', sinonTest(async function() {
		const findAllStub = this.stub(models.category, 'findAll');
		findAllStub.returns(categories);

		let ctx = {
			status: 200,
			body: {},
		};

		await expect(CategoryController.getAll(ctx, () => {}), 'Getting all categories should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should remain the same').to.equal(200);
		expect(ctx.body, 'Categories should be returned').to.deep.equal(categories);
	}));

	it('Throws error when getting all categories of empty DB', sinonTest(async function() {
		const findAllStub = this.stub(models.category, 'findAll');
		findAllStub.returns([]);

		let ctx = {
			status: 200,
			body: {},
		};

		expect(CategoryController.getAll(ctx, () => {}), 'Error should be thrown')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Gets a single category', sinonTest(async function() {
		const findOne = this.stub(models.category, 'findOne');
		findOne.returns(categories[0]);

		let ctx = {
			status: 200,
			body: {},
			params: {id: 1},
		};

		await expect(CategoryController.get(ctx, () => {}), 'Getting category should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should remain the same').to.equal(200);
		expect(ctx.body, 'The category should be returned').to.deep.equal(categories[0]);
	}));

	it('Throws error when getting invalid category', sinonTest(async function() {
		const findOne = this.stub(models.category, 'findOne');
		findOne.returns(null);

		let ctx = {
			status: 200,
			body: {},
			params: {id: 1},
		};

		return expect(CategoryController.get(ctx, () => {}), 'Error should be thrown')
			.to.eventually.be.rejectedWith(ApiError);
	}));
});
