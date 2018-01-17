<template>
	<div class="container">
		<div id="mini-container">
			<h1>Create an account</h1>
			<br/>
			<form>
				<div class="input-group">
					<span class="input-group-addon">
						<span class="fa fa-user"></span>
					</span>
					<input type="text" class="form-control" placeholder="Username" v-model="username" autofocus>
				</div>
				<div class="input-group">
					<span class="input-group-addon">
						<span class="fa fa-envelope"></span>
					</span>
					<input type="email" class="form-control" placeholder="Email" v-model="email">
				</div>
				<div class="input-group">
					<span class="input-group-addon">
						<span class="fa fa-key"></span>
					</span>
					<input type="password" class="form-control" placeholder="Password" v-model="password">
				</div>
				<br/>
				<invisible-recaptcha sitekey="6Lf3UygUAAAAAMq-bXV5Q6eVzeHD-edRvYbF20bU" :validate="submit" :callback="signup"
					class="btn btn-primary" type="submit" id="signup-btn" :disabled="loading || created">
					Create account
				</invisible-recaptcha>
				<router-link :to="{name: 'github-signin'}" class="mt-2 btn btn-default" id="github-signin" tag="button">
					Sign up with GitHub
				</router-link>
			</form>
			<br/>
			
			<p>
				Existing user? <router-link :to="{name: 'signin'}">Sign in here</router-link> <br/>
			</p>
			<br/>
			<loader v-if="loading"/>
			<div class="alert alert-danger" v-if="error">{{error}}</div>
			<div class="alert alert-success" v-if="message">{{message}}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import InvisibleRecaptcha from '../InvisibleRecaptcha.vue';
	import {extractError, apiUrl} from '../../helpers';

	export default {
		data: () => ({
			loading: false,
			error: false,
			message: false,
			created: false,

			username: '',
			email: '',
			password: '',
		}),

		methods: {
			submit: function() {
				this.error = false;
				this.loading = true;
			},

			signup: function(recaptchaToken) {
				axios.post(apiUrl('/users'), {
					username: this.username,
					email: this.email,
					password: this.password,
					recaptcha_token: recaptchaToken,
				}).then(response => {
					this.created = true;
					this.loading = false;
					this.message = 'Great! Now go to your inbox and verify your email.';
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				});
			}
		},

		meta: {
			title: 'Create a new account',

			meta: [
				{name: 'description', content: 'Sign up now to get the most out of CodeBottle. The community needs you and it only takes few seconds to get started.'},
				{property: 'og:title', content: 'Create a new account'},
				{property: 'og:description', content: 'Sign up now to get the most out of CodeBottle. The community needs you and it only takes few seconds to get started.'},
			],
		},

		components: {
			InvisibleRecaptcha,
		},
	};
</script>

<style type="text/css" scoped>
	#mini-container {
		max-width: 340px;
		text-align: center;
		margin: auto;
		margin-top: 84px;
	}

	#signup-btn {
		width: 100%;
		text-transform: uppercase;
	}

	#github-signin {
		color: white !important;
		background: #303030;
		width: 100%;
	}

	#github-signin:hover {
		background: #373737;
	}

	.fa {
		width: 16px;
	}
</style>