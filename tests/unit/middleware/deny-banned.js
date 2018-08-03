require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const ApiError = require('../../../errors/api-error');
const denyBanned = require('../../../middleware/deny-banned');

chai.use(sinonChai);

describe('Auth middleware', () => {
	const overcoder = {
		username: 'OverCoder',
		bio: 'Enthusiastic developer',
	};

	it('Denies banned users', sinonTest(async function () {
		let ctx = {
			status: 200,
			body: {},
			state: {
				user: {...overcoder, banned: true}
			},
		};

		return expect(denyBanned(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Does not deny not banned users', sinonTest(async function () {
		let ctx = {
			status: 200,
			body: {},
			state: {
				user: {...overcoder, banned: false}
			},
		};

		return expect(denyBanned(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;
	}));

	it('Rejects unauthenticated requests', sinonTest(async function () {
		let ctx = {
			status: 200,
			body: {},
			state: {},
		};

		await expect(denyBanned(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
	}));
});