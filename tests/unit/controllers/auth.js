require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const cryptojs = require('crypto-js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../../../errors/api-error');
const AuthController = require('../../../controllers/auth');
const models = require('../../../models');
const redis = require('../../../redis');
const helpers = require('../../../helpers');
const nodemailer = require('../../../nodemailer');
const simpleOAuth = require('simple-oauth2');
const axios = require('axios');
const logger = require('../../../utils/logger');
const _ = require('lodash');

chai.use(sinonChai);

describe('Auth controller', () => {
	let findUserStub = null;
	let bcryptStub = null;
	let recaptchaStub = null;
	let sandbox = null;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		findUserStub = sinon.stub(models.user, 'findOne');
		bcryptStub = sinon.stub(bcrypt, 'compare');
		recaptchaStub = sinon.stub(helpers, 'verifyRecaptcha');
		recaptchaStub.returns(true);
	});

	afterEach(() => {
		sandbox.restore();
		findUserStub.restore();
		bcryptStub.restore();
		recaptchaStub.restore();
	});

	// This must be the same error every time so that one
	// Can't distingush between either or both inputs are wrong.
	const rejectionMessage = 'Invalid username or password';

	// We will authenticate this weird guy
	const overcoder = {
		id: 1,
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
			findUserStub.returns(user);
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
		findUserStub.returns(overcoder);
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
		expect(sha256Stub, 'User should be hashed using SHA256').to.have.been.calledWith(
			_.pick(overcoder, ['id', 'username', 'email', 'password', 'banned', 'activated'])
		);

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

	const resetPassword = (passwordReset, cachedKey) => {
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

		findUserStub.returns({
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
		findUserStub.returns(null);

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
		findUserStub.returns(null);

		const createResetStub = this.stub(models.passwordReset, 'create');
		const getAsyncStub = this.stub(redis, 'getAsync');
		const setAsyncStub = this.stub(redis, 'setAsync');
		const sendEmailStub = this.stub(nodemailer, 'sendMail');

		getAsyncStub.returns(1);

		findUserStub.returns({
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

	it('Throws error when changing password with invalid params', sinonTest(async function () {
		const findPasswordStub = this.stub(models.passwordReset, 'findOne');

		findPasswordStub.returns({
			email: overcoder.email,
		});

		const attempt = body => {
			const ctx = {
				status: 200,
				body: {},
				request: {body},
			};

			return expect(AuthController.changePassword(ctx, () => {}), 'Should throw error')
				.to.eventually.be.rejectedWith(ApiError)
				.then(e => {
					expect(e.status, 'Status should be 422').to.equal(422);
				});
		};

		await attempt({                                             });
		await attempt({token: 'some_token',                         });
		await attempt({                     password: 'somepassword'});
		await attempt({token: 'some_token', password: 'short'       });

		expect(findPasswordStub, 'Password reset should not be queried')
			.to.not.have.been.called;

		findPasswordStub.returns(undefined);

		await attempt({token: 'some_token', password: 'somepassword'});

		expect(findPasswordStub, 'Password reset should be queried')
			.to.have.been.calledOnce;
	}));

	it('Changes password given token from password reset', sinonTest(async function () {
		const findPasswordStub = this.stub(models.passwordReset, 'findOne');
		const destroyStub = this.stub();
		const saveStub = this.stub();
		const bcryptStub = this.stub(bcrypt, 'hash');
		const getUserStub = this.stub();

		const overcoderClone = {
			...overcoder,
			save: saveStub,
		};

		const token = 'some_token';
		const password = 'some_password';
		const bcrypted = password + '_hashed';
		const reset = {
			email: overcoderClone.email,
			destroy: destroyStub,
			getUser: getUserStub,
		};

		findPasswordStub.returns(reset);
		bcryptStub.returns(bcrypted);
		getUserStub.returns(overcoderClone);

		const ctx = {
			status: 200,
			body: {},
			request: {
				body: {token, password,}
			},
		};

		await expect(AuthController.changePassword(ctx, () => {}), 'Should throw error')
			.to.eventually.be.fulfilled;

		expect(findPasswordStub, 'Password reset should be queried').to.be.calledOnce;
		expect(bcryptStub, 'Password should be bcrypted').to.be.calledOnce;
		expect(getUserStub, 'User should be queried').to.be.calledOnce;
		expect(saveStub, 'User should be saved').to.be.calledOnce;
		expect(overcoderClone.password, 'Password should be set').to.equal(bcrypted);
		expect(ctx.status, 'Status should be set to 204').to.equal(204);
	}));

	// TODO: deduplication needed

	it('Throw error on GitHub auth with invalid parameters', sinonTest(async function () {
		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {}
			},
		};

		return expect(AuthController.github(ctx, () => {}), 'Should throw error')
			.to.eventually.to.be.rejectedWith(ApiError)
			.then(e => {
				expect(e.status, 'Status should be 422').to.equal(422);
			});
	}));

	it('Throws error on GitHub auth failure', sinonTest(async function () {
		this.stub(logger, 'warn');
		this.stub(logger, 'err');

		const oauthCreateStub = this.stub(simpleOAuth, 'create');
		const getTokenStub = this.stub();
		const getGitHubUserStub = this.stub(helpers, 'getGitHubUser');
		const findConnectionStub = this.stub(models.socialConnection, 'findOne');

		const oauthMock = {
			authorizationCode: {
				getToken: getTokenStub
			}
		};

		oauthCreateStub.returns(oauthMock);

		const token = 'some_token';
		const code = 'some_code';

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {code}
			},
		};

		getTokenStub.rejects(Error);
		await expect(AuthController.github(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
		expect(getTokenStub, 'Token should be fetched').to.have.been.calledOnce;
		expect(getGitHubUserStub, 'User data should not be fetched').to.not.have.been.called;

		getTokenStub.reset();
		getTokenStub.resolves({access_token: token});
		getGitHubUserStub.rejects(Error);

		await expect(AuthController.github(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
		expect(getTokenStub, 'Token should be fetched').to.have.been.calledOnce;
		expect(getGitHubUserStub, 'User data should not be fetched').to.have.been.calledOnce;
		expect(findConnectionStub, 'Social connection should not be fetched').to.not.have.been.called;
	}));

	it('Logs in on GitHub auth', sinonTest(async function () {
		const oauthCreateStub = this.stub(simpleOAuth, 'create');
		const getTokenStub = this.stub();
		const getGitHubUserStub = this.stub(helpers, 'getGitHubUser');
		const jwtStub = this.stub(jwt, 'sign');
		const findConnectionStub = this.stub(models.socialConnection, 'findOne');
		const saveConnectionStub = this.stub();
		const getConnectionUserStub = this.stub();
		const sha256Stub = this.stub(cryptojs, 'SHA256');
		sha256Stub.returns('somehash');

		const oauthMock = {
			authorizationCode: {
				getToken: getTokenStub
			}
		};

		oauthCreateStub.returns(oauthMock);

		const apiToken = 'some_api_token';
		const token = 'some_token';
		const code = 'some_code';
		const githubUser = {
			id: '12345',
			login: overcoder.username,
			email: overcoder.email,
			bio: overcoder.bio,
		};

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {code}
			},
		};

		getTokenStub.resolves({access_token: token});
		getGitHubUserStub.resolves({
			data: githubUser
		});
		findConnectionStub.resolves({
			save: saveConnectionStub,
			getUser: getConnectionUserStub,
		});

		getConnectionUserStub.returns(overcoder);
		jwtStub.returns(apiToken);

		await expect(AuthController.github(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(getTokenStub, 'Token should be fetched').to.have.been.calledOnce;
		expect(getGitHubUserStub, 'User data should be fetched').to.have.been.calledOnce;
		expect(jwtStub, 'JWT token should be created').to.have.been.calledOnce;
		expect(saveConnectionStub, 'New token should be saved to connection').to.have.been.calledOnce;
		expect(getConnectionUserStub, 'Connection\'s user should be queried').to.have.been.calledOnce;
		
		expect(ctx.status, 'Status should be 200').to.equal(200);
		expect(ctx.body.username, 'Username should be set').to.equal(overcoder.username);
		expect(ctx.body.expires_in, 'Expires in should be set').to.equal(84600 * 90);
		expect(ctx.body.token_type, 'Token type should be Bearer').to.equal('Bearer');
		expect(ctx.body.token, 'API token should be set').to.equal(apiToken);
	}));

	it('Registers new users on GitHub auth', sinonTest(async function () {
		const oauthCreateStub = this.stub(simpleOAuth, 'create');
		const getTokenStub = this.stub();
		const axiosStub = this.stub(axios, 'get');
		const jwtStub = this.stub(jwt, 'sign');
		const sha256Stub = this.stub(cryptojs, 'SHA256');
		sha256Stub.returns('somehash');

		const findConnectionStub = this.stub(models.socialConnection, 'findOne');
		const createConnectionStub = this.stub(models.socialConnection, 'create');

		const createUserStub = this.stub(models.user, 'create');

		const oauthMock = {
			authorizationCode: {
				getToken: getTokenStub
			}
		};

		oauthCreateStub.returns(oauthMock);

		const apiToken = 'some_api_token';
		const token = 'some_token';
		const code = 'some_code';
		const githubUser = {
			id: '12345',
			login: overcoder.username,
			email: overcoder.email,
			bio: overcoder.bio,
		};

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {code}
			},
		};

		getTokenStub.resolves({access_token: token});
		axiosStub.resolves({
			data: githubUser
		});

		createUserStub.returns(overcoder);

		jwtStub.returns(apiToken);

		await expect(AuthController.github(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(getTokenStub, 'Token should be fetched').to.have.been.calledOnce;
		expect(axiosStub, 'User data should be fetched').to.have.been.calledOnce;
		expect(jwtStub, 'JWT token should be created').to.have.been.calledOnce;
		expect(findConnectionStub, 'Existing connection should be queried').to.have.been.calledOnce;
		expect(createConnectionStub, 'New connection should be created').to.have.been.calledOnce;
		expect(createUserStub, 'New user should be created').to.have.been.calledOnce;
		expect(findUserStub, 'Existing username/email should be checked').to.have.been.calledOnce;

		expect(ctx.status, 'Status should be 200').to.equal(200);
		expect(ctx.body.username, 'Username should be set').to.equal(overcoder.username);
		expect(ctx.body.expires_in, 'Expires in should be set').to.equal(84600 * 90);
		expect(ctx.body.token_type, 'Token type should be Bearer').to.equal('Bearer');
		expect(ctx.body.token, 'API token should be set').to.equal(apiToken);
	}));

	it('Creates valid username on creating user with GitHub auth', sinonTest(async function () {
		const oauthCreateStub = this.stub(simpleOAuth, 'create');
		const getTokenStub = this.stub();
		const axiosStub = this.stub(axios, 'get');
		const jwtStub = this.stub(jwt, 'sign');
		const sha256Stub = this.stub(cryptojs, 'SHA256');
		sha256Stub.returns('somehash');

		const findConnectionStub = this.stub(models.socialConnection, 'findOne');
		const createConnectionStub = this.stub(models.socialConnection, 'create');

		const createUserStub = this.stub(models.user, 'create');

		const oauthMock = {
			authorizationCode: {
				getToken: getTokenStub
			}
		};

		oauthCreateStub.returns(oauthMock);

		const username = '$!@$  a2';
		const apiToken = 'some_api_token';
		const token = 'some_token';
		const code = 'some_code';
		const githubUser = {
			id: '12345',
			login: username,
			email: overcoder.email,
			bio: overcoder.bio,
		};

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {code}
			},
		};

		getTokenStub.resolves({access_token: token});
		axiosStub.resolves({
			data: githubUser
		});

		createUserStub.returns(overcoder);

		jwtStub.returns(apiToken);

		await expect(AuthController.github(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(getTokenStub, 'Token should be fetched').to.have.been.calledOnce;
		expect(axiosStub, 'User data should be fetched').to.have.been.calledOnce;
		expect(jwtStub, 'JWT token should be created').to.have.been.calledOnce;
		expect(findConnectionStub, 'Existing connection should be queried').to.have.been.calledOnce;
		expect(createConnectionStub, 'New connection should be created').to.have.been.calledOnce;
		expect(createUserStub, 'New user should be created').to.have.been.calledOnce;
		expect(findUserStub, 'Existing username/email should be checked').to.have.been.calledOnce;

		expect(ctx.status, 'Status should be 200').to.equal(200);
		expect(ctx.body.username, 'Username should be set').to.equal('a20');
		expect(ctx.body.expires_in, 'Expires in should be set').to.equal(84600 * 90);
		expect(ctx.body.token_type, 'Token type should be Bearer').to.equal('Bearer');
		expect(ctx.body.token, 'API token should be set').to.equal(apiToken);
	}));

	it('Throws error on GitHub auth with existing username/email', sinonTest(async function () {
		const oauthCreateStub = this.stub(simpleOAuth, 'create');
		const getTokenStub = this.stub();
		const axiosStub = this.stub(axios, 'get');

		const findConnectionStub = this.stub(models.socialConnection, 'findOne');
		const createConnectionStub = this.stub(models.socialConnection, 'create');

		const createUserStub = this.stub(models.user, 'create');

		const oauthMock = {
			authorizationCode: {
				getToken: getTokenStub
			}
		};

		oauthCreateStub.returns(oauthMock);

		const token = 'some_token';
		const code = 'some_code';
		const githubUser = {
			id: '12345',
			login: overcoder.username,
			email: overcoder.email,
			bio: overcoder.bio,
		};

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {code}
			},
		};

		getTokenStub.resolves({access_token: token});
		axiosStub.resolves({
			data: githubUser
		});

		findUserStub.returns(overcoder);

		await expect(AuthController.github(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(getTokenStub, 'Token should be fetched').to.have.been.calledOnce;
		expect(axiosStub, 'User data should be fetched').to.have.been.calledOnce;
		expect(findConnectionStub, 'Existing connection should be queried').to.have.been.calledOnce;
		expect(createConnectionStub, 'New connection should not be created').to.not.have.been.calledOnce;
		expect(createUserStub, 'New user should not be created').to.not.have.been.called;
		expect(findUserStub, 'Existing username/email should be checked').to.have.been.calledOnce;
	}));
});
