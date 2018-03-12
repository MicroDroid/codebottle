require('dotenv').config();

const gravatar = require('gravatar');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const _ = require('lodash');
const cryptojs = require('crypto-js');
const redis = require('../../../redis');
const helpers = require('../../../helpers');
const nodemailer = require('../../../nodemailer');
const ApiError = require('../../../errors/api-error');
const models = require('../../../models');
const UserController = require('../../../controllers/user');

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('User controller', () => {
	let recaptchaStub = null;

	beforeEach(() => {
		recaptchaStub = sinon.stub(helpers, 'verifyRecaptcha');
		recaptchaStub.returns(true);
	});

	afterEach(() => {
		recaptchaStub.restore();
	});

	const overcoder = {
		id: 1,
		username: 'OverCoder',
		email: 'some@example.com',
		bio: 'Enthusiastic developer',
		password: 'password',
		banned: false, // no you cant ban me
		created_at: (new Date()).toISOString(),

		userPreferences: {
			private_email: true,
			convert_tabs_to_spaces: true,
			indentation_size: 4
		},
	};

	it('Gets user properly', sinonTest(async function () {
		const findOneStub = this.stub(models.user, 'findOne');
		const getGitHubStub = this.stub(helpers, 'getGitHubUsername');
		const transformUserStub = this.stub(models.user, 'transform');

		findOneStub.returns(_.pick(overcoder, 'username', 'email', 'bio', 'banned', 'created_at', 'userPreferences'));

		let ctx = {
			status: 200,
			body: {},
			params: { username: 'OverCoder' },
		};

		await expect(UserController.get(ctx, () => { }), 'Getting a user should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be the same').to.equal(200);
		expect(getGitHubStub, 'GitHub username should be queried').to.have.been.calledOnce;
		expect(transformUserStub, 'User should be transformed').to.have.been.calledOnce;
	}));

	it('Gets user snippets', sinonTest(async function () {
		const findOneStub = this.stub(models.user, 'findOne');
		const transformSnippetStub = this.stub(models.snippet, 'transform');

		const user = {
			..._.pick(overcoder, 'username', 'email', 'bio', 'banned', 'created_at', 'userPreferences'),
			snippets: []
		};

		findOneStub.returns(user);

		let ctx = {
			status: 200,
			body: {},
			params: { username: 'OverCoder' },
		};

		await expect(UserController.getSnippets(ctx, () => { }), 'Getting user snippets should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be the same').to.equal(200);
		expect(findOneStub, 'User should be queried').to.have.been.calledOnce;
		expect(transformSnippetStub, 'No snippets should be transformed').to.not.have.been.called;

		const category = {
			id: 1,
			name: 'Function',
		};

		const language = {
			id: 1,
			name: 'JavaScript',
		};

		user.snippets = [
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


		await expect(UserController.getSnippets(ctx, () => { }), 'Getting user snippets should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be the same').to.equal(200);
		expect(findOneStub, 'User should be queried').to.have.been.calledTwice;
		expect(transformSnippetStub, 'Two snippets should be transformed').to.have.been.calledTwice;
	}));

	it('Throws error when getting inexistent user snippets', sinonTest(async function () {
		const findOneStub = this.stub(models.user, 'findOne');
		const transformSnippetStub = this.stub(models.snippet, 'transform');

		let ctx = {
			status: 200,
			body: {},
			params: {username: 'NotOverCoder'},
		};

		await expect(UserController.getSnippets(ctx, () => { }), 'Getting user snippets should fail')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findOneStub, 'User should be queried').to.have.been.calledOnce;
		expect(transformSnippetStub, 'No snippets should be transformed').to.not.have.been.called;
	}));

	it('Shows/Hides email based on preferences', sinonTest(async function () {
		const findOneStub = this.stub(models.user, 'findOne');
		const getGitHubStub = this.stub(helpers, 'getGitHubUsername');
		const transformUserStub = this.stub(models.user, 'transform');

		const overcoderClone = _.pick(overcoder, 'username', 'email', 'bio', 'banned', 'created_at', 'userPreferences');

		findOneStub.returns(overcoderClone);

		let ctx = {
			status: 200,
			body: {},
			params: {username: 'OverCoder'},
		};

		// Integer because that's what's stored in DB
		overcoderClone.userPreferences.private_email = '1';

		await expect(UserController.get(ctx, () => {}), 'Getting a user should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be the same').to.equal(200);
		expect(transformUserStub, 'User should be transformed').to.have.been.calledWith(sinon.match.any, true, sinon.match.any);

		overcoderClone.userPreferences.private_email = '0';

		await expect(UserController.get(ctx, () => {}), 'Getting a user should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be the same').to.equal(200);
		expect(getGitHubStub, 'GitHub username should be queried').to.have.been.calledTwice;
		expect(transformUserStub, 'User should be transformed').to.have.been.calledWith(sinon.match.any, false, sinon.match.any);
		
	}));

	it('Throws error when user is not found', sinonTest(async function() {
		const findOneStub = this.stub(models.user, 'findOne');
		findOneStub.returns(null);

		let ctx = {
			status: 200,
			body: {},
			params: {username: 'NotOverCoder'},
		};

		return expect(UserController.get(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);
	}));

	it('Throws error when creating invalid user', sinonTest(async function () {
		const attempt = (body) => {
			let ctx = {
				status: 200,
				body: {},
				request: {body},
			};

			return expect(UserController.create(ctx, () => {}), 'Should throw error')
				.to.eventually.be.rejectedWith(ApiError);
		};

		const username = 'OverCoder';
		const email = 'example@email.com';
		const password = 'lol nice password';

		// Let's bombard!!
  
		await attempt({                                    email,                          });
		await attempt({                                    email,             password     });
		await attempt({                                    email,             password: 'a'});
		await attempt({                                    email: 'invalid!',              });
		await attempt({                                    email: 'invalid!', password     });
		await attempt({                                    email: 'invalid!', password: 'a'});
		await attempt({                                                                    });
		await attempt({                                                       password     });
		await attempt({                                                       password: 'a'});

		await attempt({username,                                                           });
		await attempt({username,                           email,                          });
		await attempt({username,                           email,             password: 'a'});
		await attempt({username,                           email: 'invalid!',              });
		await attempt({username,                           email: 'invalid!', password     });
		await attempt({username,                           email: 'invalid!', password: 'a'});
		await attempt({username,                                              password     });
		await attempt({username,                                              password: 'a'});
 
		await attempt({username: '@#!!',                                                   });
		await attempt({username: '@#!!',                   email,                          });
		await attempt({username: '@#!!',                   email,             password     });
		await attempt({username: '@#!!',                   email,             password: 'a'});
		await attempt({username: '@#!!',                   email: 'invalid!',              });
		await attempt({username: '@#!!',                   email: 'invalid!', password     });
		await attempt({username: '@#!!',                   email: 'invalid!', password: 'a'});
		await attempt({username: '@#!!',                                      password     });
		await attempt({username: '@#!!',                                      password: 'a'});

		await attempt({username: 'a',                                                      });
		await attempt({username: 'a',                      email,                          });
		await attempt({username: 'a',                      email,             password     });
		await attempt({username: 'a',                      email,             password: 'a'});
		await attempt({username: 'a',                      email: 'invalid!',              });
		await attempt({username: 'a',                      email: 'invalid!', password     });
		await attempt({username: 'a',                      email: 'invalid!', password: 'a'});
		await attempt({username: 'a',                                         password     });
		await attempt({username: 'a',                                         password: 'a'});

		await attempt({username: 'a_quite_long_string',                                    });
		await attempt({username: 'a_quite_long_string',    email,                          });
		await attempt({username: 'a_quite_long_string',    email,             password     });
		await attempt({username: 'a_quite_long_string',    email,             password: 'a'});
		await attempt({username: 'a_quite_long_string',    email: 'invalid!',              });
		await attempt({username: 'a_quite_long_string',    email: 'invalid!', password     });
		await attempt({username: 'a_quite_long_string',    email: 'invalid!', password: 'a'});
		await attempt({username: 'a_quite_long_string',                       password     });
		await attempt({username: 'a_quite_long_string',                       password: 'a'});
	}));

	it('Throw errors when creating a user with used credentials', sinonTest(async function () {
		const userCreateStub = this.stub(models.user, 'create');
		const userFindOneStub = this.stub(models.user, 'findOne');
		const emailVerificationCreateStub = this.stub(models.emailVerification, 'create');
		const sendEmailStub = this.stub(nodemailer, 'sendMail');

		userFindOneStub.returns({
			username: overcoder.username,
			email: 'blah',
		});

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: _.pick(overcoder, 'username', 'email', 'password'),
			},
		};

		await expect(UserController.create(ctx, () => {}), 'Creating a user should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(userCreateStub, 'User should be not created').to.not.have.been.called;
		expect(emailVerificationCreateStub, 'Email verification should be not created').to.not.have.been.called;
		expect(sendEmailStub, 'Email should be not sent').to.not.have.been.called;


		userFindOneStub.returns({
			username: 'blah',
			email: overcoder.email
		});

		await expect(UserController.create(ctx, () => {}), 'Creating a user should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(userCreateStub, 'User should be not created').to.not.have.been.called;
		expect(emailVerificationCreateStub, 'Email verification should be not created').to.not.have.been.called;
		expect(sendEmailStub, 'Email should be not sent').to.not.have.been.called;
	}));

	it('Creates a user', sinonTest(async function () {
		const userCreateStub = this.stub(models.user, 'create');
		const userPrefsCreateStub = this.stub(models.userPreferences, 'create');
		const userFindOneStub = this.stub(models.user, 'findOne');
		const emailVerificationCreateStub = this.stub(models.emailVerification, 'create');
		const bcryptStub = this.stub(bcrypt, 'hash');
		const cryptoStub = this.stub(crypto, 'randomBytes');
		const sha256Stub = this.stub(cryptojs, 'SHA256');
		const sendEmailStub = this.stub(nodemailer, 'sendMail');
		const getHeaderStub = this.stub();

		const verificationToken = 'whatever_test_token';

		getHeaderStub.withArgs('User-Agent').returns('Some user agent');
		userFindOneStub.returns(null);
		userCreateStub.returns(overcoder);
		sha256Stub.returns('somehash');
		bcryptStub.returns(overcoder.password);
		cryptoStub.returns(verificationToken);

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: _.pick(overcoder, 'username', 'email', 'password'),
			},
			'get': getHeaderStub,
		};

		await expect(UserController.create(ctx, () => {}), 'Creating a user should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.status, 'Status should be set to 204').to.equal(204);
		expect(ctx.body, 'Body should be unchanged').to.deep.equal({});
		expect(userPrefsCreateStub, 'User preferences should be created').to.have.been.calledOnce;
		expect(userCreateStub, 'User should be created').to.have.been.calledWith(_.pick(overcoder, 'username', 'email', 'password'));
		expect(emailVerificationCreateStub, 'Email verification should be created').to.have.been.calledOnce;
		expect(sendEmailStub, 'Email should be sent').to.have.been.calledOnce;
		expect(getHeaderStub, 'User-Agent header should be queried').to.have.been.called;
		expect(bcryptStub, 'Bcrypt should have been called').to.have.been.calledOnce;
		expect(sha256Stub, 'Verification token should be hashed with SHA256').to.have.been.calledWith(verificationToken);
		expect(cryptoStub, 'Crypto should be called for creating token').to.have.been.calledWith(16);
	}));

	it('Throws error on registration with invalid reCAPTCHA', sinonTest(async function() {
		recaptchaStub.returns(false);

		const userCreateStub = this.stub(models.user, 'create');
		const userFindOneStub = this.stub(models.user, 'findOne');
		const emailVerificationCreateStub = this.stub(models.emailVerification, 'create');
		const sendEmailStub = this.stub(nodemailer, 'sendMail');

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: _.pick(overcoder, 'username', 'email', 'password'),
			},
		};

		await expect(UserController.create(ctx, () => {}), 'Creating a user should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(userFindOneStub, 'DB should not be queried').to.not.have.been.called;
		expect(userCreateStub, 'User should be not created').to.not.have.been.called;
		expect(emailVerificationCreateStub, 'Email verification should be not created').to.not.have.been.called;
		expect(sendEmailStub, 'Email should be not sent').to.not.have.been.called;
	}));

	it('Throws error when verifies email with invalid token', sinonTest(async function () {
		const token = 'some_token';
		const findOneStub = this.stub(models.emailVerification, 'findOne');
		const sha256Stub = this.stub(cryptojs, 'SHA256');
		findOneStub.returns(null);
		sha256Stub.returns('some_hash');

		let ctx = {
			status: 200,
			body: {},
			request: {body: {}},
		};

		await expect(UserController.verifyEmail(ctx, () => {}), 'Error should be thrown')
			.to.eventually.be.rejectedWith(ApiError);

		ctx.request.body.token = token;

		await expect(UserController.verifyEmail(ctx, () => {}), 'Error should be thrown')
			.to.eventually.be.rejectedWith(ApiError);

		expect(findOneStub, 'Email verifications should be searched once').to.have.been.calledOnce;
	}));

	it('Verifies emails', sinonTest(async function () {
		const token = 'some_token';

		const userSaveStub = this.stub();
		const verificationDestroyStub = this.stub();

		const notOverCoder = {
			...overcoder,
			activated: false,
			save: userSaveStub,
		};

		// Notice email is undefined here
		let verification = {
			getUser: () => notOverCoder,
			destroy: verificationDestroyStub,
		};

		const findOneStub = this.stub(models.emailVerification, 'findOne');
		const sha256Stub = this.stub(cryptojs, 'SHA256');
		findOneStub.returns(verification);
		sha256Stub.returns('some_hash');

		let ctx = {
			status: 200,
			body: {},
			request: {body: {token}},
		};

		await expect(UserController.verifyEmail(ctx, () => {}))
			.to.eventually.be.fulfilled;
		expect(findOneStub).to.have.been.calledOnce;
		expect(sha256Stub).to.have.been.calledOnce;
		expect(userSaveStub).to.have.been.calledOnce;
		expect(verificationDestroyStub).to.have.been.calledOnce;
		expect(notOverCoder.activated).to.be.true;
		expect(notOverCoder.email).to.equal(overcoder.email);

		// Try with email set in verification

		notOverCoder.activated = false;
		verification.email = 'not@the.same.email';

		await expect(UserController.verifyEmail(ctx, () => {}))
			.to.eventually.be.fulfilled;
		expect(findOneStub).to.have.been.calledTwice;
		expect(sha256Stub).to.have.been.calledTwice;
		expect(userSaveStub).to.have.been.calledTwice;
		expect(verificationDestroyStub).to.have.been.calledTwice;
		expect(notOverCoder.activated).to.be.true;
		expect(notOverCoder.email).to.equal(verification.email);
	}));

	it('Gets self', sinonTest(async function () {
		const transformStub = this.stub(models.user, 'transform');
		const getGitHubStub = this.stub(helpers, 'getGitHubUsername');

		let ctx = {
			status: 200,
			body: {},
			state: {
				user: overcoder,
			}
		};

		await expect(UserController.getSelf(ctx, () => {}))
			.to.eventually.be.fulfilled;

		expect(transformStub, 'User should be transformed').to.have.been.calledOnce;
		expect(getGitHubStub, 'GitHub username should be queried').to.have.been.calledOnce;
	}));

	it('Throws error when setting self with invalid params', sinonTest(async function () {
		const findUserStub = this.stub(models.user, 'findOne');

		const attempt = (body) => {
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

			return expect(UserController.setSelf(ctx, () => {}), 'Should throw error')
				.to.eventually.be.rejectedWith(ApiError);
		};

		const combinations = helpers.generateCombinations({
			username: [undefined, 'hello#!', 'a', 'long'.repeat(5), 'OverCoder'],
			bio: [undefined, 'some bio'],
			email: [undefined, 'test', 'some@email.com'],
		}).filter(combination => {
			return !(combination.username === 'OverCoder'
				&& combination.email === 'some@email.com');
		});

		for (let combination of combinations)
			await attempt(combination);

		expect(findUserStub, 'User should not be queried').to.not.have.been.called;
	}));

	it('Throws error on conflict setting self', sinonTest(async function () {
		const findUserStub = this.stub(models.user, 'findOne');
		const saveUserStub = this.stub();
		const redisSetAsyncStub = this.stub(redis, 'setAsync');
		const redisGetAsyncStub = this.stub(redis, 'getAsync');
		const getHeaderStub = this.stub();

		const notOverCoder = {
			id: 2,
			username: 'NotOvercoder',
			email: 'not.over@coder.com',
			bio: 'Not a developer',
		};

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					username: overcoder.username,
					email: overcoder.email,
					bio: overcoder.bio,
				}
			},
			state: {
				user: {
					...overcoder,
					id: 1,
					save: saveUserStub,
				},
			},
			get: getHeaderStub,
		};

		findUserStub.returns(notOverCoder);

		ctx.request.body.username = notOverCoder.username;

		await expect(UserController.setSelf(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		ctx.request.body.username = overcoder.username;
		ctx.request.body.email = notOverCoder.email;

		await expect(UserController.setSelf(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(redisGetAsyncStub, 'Redis should not be queried').to.not.have.been.called;
		expect(redisSetAsyncStub, 'Redis should not be modified').to.not.have.been.called;
		expect(saveUserStub, 'User should not be saved').to.not.have.been.called;
		expect(getHeaderStub, 'Headers should not be queried').to.not.have.been.called;
	}));

	it('Sets self', sinonTest(async function () {
		const findUserStub = this.stub(models.user, 'findOne');
		const saveUserStub = this.stub();
		const redisSetAsyncStub = this.stub(redis, 'setAsync');
		const redisGetAsyncStub = this.stub(redis, 'getAsync');
		const verificationUpsertStub = this.stub(models.emailVerification, 'upsert');
		const getHeaderStub = this.stub();
		const cryptoStub = this.stub(crypto, 'randomBytes');

		const token = 'some_token';
		cryptoStub.returns(token);

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					username: overcoder.username,
					email: overcoder.email,
					bio: overcoder.bio,
				}
			},
			state: {
				user: {
					...overcoder,
					id: 1,
					save: saveUserStub,
				},
			},
			get: getHeaderStub,
		};

		findUserStub.returns(null);

		await expect(UserController.setSelf(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(verificationUpsertStub, 'Verification should not be upserted').to.not.have.been.called;
		expect(redisGetAsyncStub, 'Redis should not be queried').to.not.have.been.called;
		expect(redisSetAsyncStub, 'Redis should not be modified').to.not.have.been.called;
		expect(getHeaderStub, 'Headers should not be queried').to.not.have.been.called;
		expect(saveUserStub, 'User should be saved').to.have.been.calledOnce;
		expect(cryptoStub, 'Token should not be generated').to.not.have.been.called;
		expect(_.pick(ctx.state.user, ['username', 'email', 'bio']))
			.to.deep.equal(_.pick(overcoder, ['username', 'email', 'bio']));

		ctx.request.body.username = 'NewUsername';
		ctx.request.body.email = 'new@email.com';
		delete ctx.request.body.bio;
		redisGetAsyncStub.returns(null);

		await expect(UserController.setSelf(ctx, () => {}), 'Should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(redisGetAsyncStub, 'Redis should be queried').to.have.been.calledOnce;
		expect(verificationUpsertStub, 'Verification should be upserted').to.have.been.calledOnce;
		expect(redisSetAsyncStub, 'Redis should be modified').to.have.been.calledOnce;
		expect(getHeaderStub, 'Headers should be queried').to.have.been.called;
		expect(cryptoStub, 'Token should be generated').to.have.been.called;
		expect(saveUserStub, 'User should be saved').to.have.been.calledTwice;
		expect(_.pick(ctx.state.user, ['username', 'email', 'bio']))
			.to.deep.equal({
				username: 'NewUsername',
				email: overcoder.email, // Old email should be still set
				bio: undefined,
			});
	}));

	it('Throttles changing email', sinonTest(async function () {
		const findUserStub = this.stub(models.user, 'findOne');
		const saveUserStub = this.stub();
		const redisSetAsyncStub = this.stub(redis, 'setAsync');
		const redisGetAsyncStub = this.stub(redis, 'getAsync');
		const verificationUpsertStub = this.stub(models.emailVerification, 'upsert');
		const getHeaderStub = this.stub();

		let ctx = {
			status: 200,
			body: {},
			request: {
				body: {
					username: overcoder.username,
					email: 'new@email.com',
					bio: overcoder.bio,
				}
			},
			state: {
				user: {
					...overcoder,
					id: 1,
					save: saveUserStub,
				},
			},
			get: getHeaderStub,
		};

		findUserStub.returns(null);

		redisGetAsyncStub.returns(1);

		await expect(UserController.setSelf(ctx, () => {}), 'Should throw error')
			.to.eventually.be.rejectedWith(ApiError);

		expect(verificationUpsertStub, 'Verification should not be upserted').to.not.have.been.called;
		expect(redisGetAsyncStub, 'Redis should be queried').to.have.been.calledOnce;
		expect(redisSetAsyncStub, 'Redis should not be modified').to.not.have.been.called;
		expect(getHeaderStub, 'Headers should not be queried').to.not.have.been.called;
		expect(saveUserStub, 'User should not be saved').to.not.have.been.called;
	}));
});
