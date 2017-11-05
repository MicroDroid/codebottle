require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const helpers = require('../../../helpers');
const ApiError = require('../../../errors/api-error');
const UserPreferencesController = require('../../../controllers/user-preferences');
const models = require('../../../models');

chai.use(sinonChai);

describe('User preferences', () => {
	it('Gets user preferences', sinonTest(async function() {
		const getPrefsStub = this.stub();
		const transformStub = this.stub(models.userPreferences, 'transform');

		let ctx = {
			status: 200,
			body: {},
			state: {
				user: {
					getUserPreferences: getPrefsStub,
				}
			}
		};

		await expect(UserPreferencesController.get(ctx, () => {}), 'Getting user preferences should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(getPrefsStub, 'Preferences should be queried').to.have.been.calledOnce;
		expect(transformStub, 'Preferences should be transformed').to.have.been.calledOnce;
	}));

	it('Throws error when setting wrong user preferences', sinonTest(async function () {
		const getPrefsStub = this.stub();
		const savePrefsStub = this.stub();

		getPrefsStub.returns({
			save: savePrefsStub
		});

		const attempt = body => {
			let ctx = {
				status: 200,
				body: {},
				request: {
					body,
				},
				state: {
					user: {
						getUserPreferences: getPrefsStub
					},
				}
			};

			return expect(UserPreferencesController.set(ctx, () => {}), 'Should throw error')
				.to.eventually.be.rejectedWith(ApiError);
		};

		const combinations = helpers.generateCombinations({
			private_email: [undefined, true, false],
			convert_tabs_to_spaces: [undefined, true, false],
			indentation_size: [undefined, 'test', 1, 9, 8, 2, 5],
		}).filter(combination => {
			return !(typeof(combination.private_email) === 'boolean'
				&& typeof(combination.convert_tabs_to_spaces) === 'boolean'
				&& !isNaN(combination.indentation_size)
				&& combination.indentation_size <= 8
				&& combination.indentation_size >= 2);
		});

		for (let combination of combinations)
			await attempt(combination);

		expect(getPrefsStub, 'Preferences should never be queried').to.have.not.been.called;
		expect(savePrefsStub, 'Preferences should never be saved').to.have.not.been.called;
	}));

	it('Sets preferences', sinonTest(async function () {
		const getPrefsStub = this.stub();
		const savePrefsStub = this.stub();

		getPrefsStub.returns({
			save: savePrefsStub
		});

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					private_email: true,
					convert_tabs_to_spaces: false,
					indentation_size: 4,
				},
			},
			state: {
				user: {
					getUserPreferences: getPrefsStub
				},
			}
		};

		await expect(UserPreferencesController.set(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(getPrefsStub, 'Preferences should be queried').to.have.been.calledOnce;
		expect(savePrefsStub, 'Preferences should be saved').to.have.been.calledOnce;
	}));
});
