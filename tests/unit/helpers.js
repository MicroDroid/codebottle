require('dotenv').config();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const axios = require('axios');
const helpers = require('../../helpers');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Helpers', () => {
	it('reCAPTCHA verification resolves to proper value', sinonTest(async function () {
		const token = 'blah';
		const postStub = this.stub(axios, 'post');

		postStub.returns({data: {success: true}});
		await expect(helpers.verifyRecaptcha(token), 'Verification should resolve to false').to.eventually.be.true;

		postStub.returns({data: {success: false}});
		await expect(helpers.verifyRecaptcha(token), 'Verification should resolve to true').to.eventually.be.false;

		expect(postStub, 'Two POST requests should be made').to.have.been.calledTwice;
	}));
});
