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
	};


	it('Gets user properly', sinonTest(async function() {
		const gravatarUrl = 'https://www.gravatar.com/avatar/s=200&r=g&d=mm';

		const findOneStub = this.stub(models.user, 'findOne');
		const gravatarStub = this.stub(gravatar, 'url');

		findOneStub.returns(_.pick(overcoder, 'username', 'email', 'bio', 'banned', 'created_at'));
		gravatarStub.returns(gravatarUrl);

		let ctx = {
			status: 200,
			body: {},
			params: {username: 'OverCoder'},
		};

		await expect(UserController.get(ctx, () => {}), 'Getting a user should be fulfilled')
			.to.eventually.be.fulfilled;

		expect(ctx.body, 'Returned user should be OverCoder').to.deep.equal({
			..._.pick(overcoder, 'username', 'email', 'bio', 'banned'),
			profileImage: gravatarUrl,
			createdAt: overcoder.created_at,
		});

		expect(ctx.status, 'Status should be the same').to.equal(200);
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
		findOneStub.returns(null);

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

	it('Verifies email', sinonTest(async function () {
		
	}));
});
