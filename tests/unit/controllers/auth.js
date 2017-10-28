require('dotenv').config();

const jwt = require('jsonwebtoken');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const cryptojs = require('crypto-js');
const bcrypt = require('bcrypt');
const ApiError = require('../../../errors/api-error');
const AuthController = require('../../../controllers/auth');
const models = require('../../../models');

chai.use(sinonChai);

describe('Auth controller', () => {
	let findOneStub = null;
	let bcryptStub = null;

	beforeEach(() => {
		findOneStub = sinon.stub(models.user, 'findOne');
		bcryptStub = sinon.stub(bcrypt, 'compare');
	});

	afterEach(() => {
		findOneStub.restore();
		bcryptStub.restore();
	});

	// This must be the same error every time so that one
	// Can't distingush between either or both inputs are wrong.
	const rejectionMessage = 'Invalid username or password';

	// We will authenticate this weird guy
	const overcoder = {
		username: 'OverCoder',
		email: 'some@example.com',
		bio: 'Enthusiastic developer',
		banned: false, // no you cant
		created_at: (new Date()).toISOString(),
		password: 'blah',
	};

	it('Throws error on incorrect credentials', async () => {
		// To reduce duplication. Mocks bcrypt
		const attempt = (credentials, user) => {
			findOneStub.returns(user);
			bcryptStub.returns(false);

			let ctx = {
				status: 200,
				body: {},
				request: {
					body: credentials
				}
			};


			return expect(AuthController.login(ctx, () => {}), 'Should throw error')
				.to.eventually.be.rejectedWith(ApiError)
				.then((e) => {
					expect(e.message, 'Message should be constant').to.equal(rejectionMessage);
					expect(e.status, 'Status should be 401').to.equal(401);
				});
		};
		
		await attempt({                                              }, overcoder);
		await attempt({username: 'OverCoder'                         }, overcoder);
		await attempt({username: 'OverCoder',        password: 'test'}, overcoder);
		await attempt({username: 'some@example.com',                 }, overcoder);
		await attempt({username: 'some@example.com', password: 'test'}, overcoder);
		await attempt({                                              }, null);
		await attempt({username: 'OverCoder'                         }, null);
		await attempt({username: 'OverCoder',        password: 'test'}, null);
		await attempt({username: 'some@example.com',                 }, null);
		await attempt({username: 'some@example.com', password: 'test'}, null);
	});

	it('Succeeds on correct credentials', sinonTest(async function () {
		findOneStub.returns(overcoder);
		bcryptStub.returns(true);

		const token = 'some_token';

		const jwtStub = this.stub(jwt, 'sign');
		jwtStub.returns(token);

		const sha256Stub = this.stub(cryptojs, 'SHA256');
		sha256Stub.returns('somehash');

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					username: 'OverCoder',
					password: 'password',
				},
			}
		};

		await expect(AuthController.login(ctx, () => {}), 'Should not throw error')
			.to.eventually.be.fulfilled;

		expect(jwtStub, 'JWT should be generated').to.have.been.calledOnce;
		expect(sha256Stub, 'User should be hashed using SHA256').to.have.been.calledWith(overcoder);

		expect(ctx.body.token, 'Token should be set properly').to.equal(token);
		expect(ctx.body.expiresIn, 'Expiry date should be in 90 days').to.equal(Date.now() + 84600 * 90);
	}));
});
