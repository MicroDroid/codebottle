require('dotenv').config();

const jwt = require('jsonwebtoken');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const cryptojs = require('crypto-js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const ApiError = require('../../../errors/api-error');
const AuthController = require('../../../controllers/auth');
const models = require('../../../models');
const redis = require('../../../redis');
const helpers = require('../../../helpers');
const nodemailer = require('../../../nodemailer');

chai.use(sinonChai);

describe('Auth controller', () => {
	let findOneStub = null;
	let bcryptStub = null;
	let recaptchaStub = null;
	let sandbox = null;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		findOneStub = sinon.stub(models.user, 'findOne');
		bcryptStub = sinon.stub(bcrypt, 'compare');
		recaptchaStub = sinon.stub(helpers, 'verifyRecaptcha');
		recaptchaStub.returns(true);
	});

	afterEach(() => {
		sandbox.restore();
		findOneStub.restore();
		bcryptStub.restore();
		recaptchaStub.restore();
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

	it('Throws error on invalid password reset', sinonTest(async function () {
		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {},
			}
		};

		return expect(AuthController.resetPassword(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError)
			.then((e) => {
				expect(e.status, 'Status should be 422').to.equal(422);
			});
	}));

	const resetPassword = (passwordReset, cachedKey, checkCreated) => {
		const token = 'some_token';

		const createResetStub = sandbox.stub(models.passwordReset, 'create');
		const cryptoStub = sandbox.stub(crypto, 'randomBytes');
		const sha256Stub = sandbox.stub(cryptojs, 'SHA256');
		const getAsyncStub = sandbox.stub(redis, 'getAsync');
		const setAsyncStub = sandbox.stub(redis, 'setAsync');
		const sendEmailStub = sandbox.stub(nodemailer, 'sendMail');
		const getPasswordReset = sandbox.stub();
		const getHeader = sandbox.stub();

		getPasswordReset.returns(passwordReset);
		getAsyncStub.returns(cachedKey);
		cryptoStub.returns(token);
		sha256Stub.returns(token + '_hashed');

		findOneStub.returns({
			...overcoder,
			getPasswordReset,
		});

		const ctx = {
			status: 200,
			body: {},
			request: {
				body: {email: overcoder.email}
			},
			get: getHeader,
		};

		return expect(AuthController.resetPassword(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled
			.then(() => {
				expect(ctx.status, 'Status should be 204').to.equal(204);
				expect(createResetStub, 'Password reset should be created').to.have.been.calledOnce;
				expect(cryptoStub, 'Random token should be generated').to.have.been.calledOnce;
				expect(sha256Stub, 'Token should be hashed').to.have.been.calledOnce;
				expect(getAsyncStub, 'Redis cache should be queried').to.have.been.calledOnce;
				expect(setAsyncStub, 'Redis cache key should be set').to.have.been.calledOnce;
				expect(sendEmailStub, 'Email should be sent').to.have.been.calledOnce;
				expect(getHeader, 'User-Agent header should be queried').to.have.been.calledWith('User-Agent');
				expect(getPasswordReset, 'Password reset existance should be checked').to.have.been.calledOnce;
			});
	};

	it('Resets password', sinonTest(async function () {
		await resetPassword(null, null);
	}));

	it('Removes existing password resets when resetting', sinonTest(async function () {
		const destroyStub = this.stub();
		const reset = {destroy: destroyStub};

		await resetPassword(reset, null);

		expect(destroyStub, 'Existing password reset should be destroyed')
			.to.have.been.calledOnce;
	}));

	it('Password reset fails with bad reCAPTCHA', sinonTest(async function () {
		recaptchaStub.returns(false);

		const ctx = {
			status: 200,
			body: {},
			request: {
				body: {email: overcoder.email}
			},
		};

		await expect(AuthController.resetPassword(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.rejectedWith(ApiError)
			.then(e => {
				expect(e.status, 'Status should be 422').to.equal(422);
			});
	}));

	it('Does nothing when resetting with unmatched user', sinonTest(async function () {
		findOneStub.returns(null);

		const ctx = {
			status: 200,
			body: {},
			request: {
				body: {email: overcoder.email}
			},
		};

		await expect(AuthController.resetPassword(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be 204').to.equal(204);
	}));

	it('Does nothing when resetting with cached key', sinonTest(async function () {
		findOneStub.returns(null);

		const createResetStub = this.stub(models.passwordReset, 'create');
		const getAsyncStub = this.stub(redis, 'getAsync');
		const setAsyncStub = this.stub(redis, 'setAsync');
		const sendEmailStub = this.stub(nodemailer, 'sendMail');

		getAsyncStub.returns(1);

		findOneStub.returns({
			...overcoder,
		});

		const ctx = {
			status: 200,
			body: {},
			request: {
				body: {email: overcoder.email}
			},
		};

		await expect(AuthController.resetPassword(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be 204').to.equal(204);
		expect(createResetStub, 'Password reset should not be created')
			.to.not.have.been.called;
		expect(getAsyncStub, 'Cached key should be queried')
			.to.have.been.calledOnce;
		expect(setAsyncStub, 'Cache key should not be set again')
			.to.not.have.been.calledOnce;
		expect(sendEmailStub, 'Email should not be sent')
			.to.not.have.been.called;
	}));
});
