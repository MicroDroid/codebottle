<template>
	<div class="container">
		<div id="mini-container" class="text-center mx-auto mt-5">
			<h1>Create an account</h1>
			<br>
			<form>
				<div class="input-group">
					<span class="input-group-prepend">
						<span class="fas fa-user input-group-text" />
					</span>
					<input type="text" class="form-control" placeholder="Username" v-model="username" autofocus>
				</div>
				<div class="input-group">
					<span class="input-group-prepend">
						<span class="fas fa-envelope input-group-text" />
					</span>
					<input type="email" class="form-control" placeholder="Email" v-model="email">
				</div>
				<div class="input-group">
					<span class="input-group-prepend">
						<span class="fas fa-key input-group-text" />
					</span>
					<input type="password" class="form-control" placeholder="Password" v-model="password">
				</div>
				<br>
				<invisible-recaptcha sitekey="6Lf3UygUAAAAAMq-bXV5Q6eVzeHD-edRvYbF20bU" :validate="submit" :callback="signup"
					class="btn btn-primary w-100" type="submit" id="signup-btn" :disabled="loading || created">
					Create account
				</invisible-recaptcha>
				<router-link :to="{name: 'github-signin'}" class="mt-2 btn btn-default w-100" id="github-signin" tag="button">
					Sign up with GitHub
				</router-link>
			</form>
			<br>
			
			<p>
				Existing user? <router-link :to="{name: 'signin'}">Sign in here</router-link><br>
			</p>
			<br>
			<loader v-if="loading"/>
			<div class="alert alert-danger" v-if="error">{{error}}</div>
			<div class="alert alert-success" v-if="message">{{message}}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import InvisibleRecaptcha from 'vue-invisible-recaptcha';
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

<style lang="scss" scoped>
	#mini-container {
		max-width: 340px;
	}

	#signup-btn {
		text-transform: uppercase;
	}

	#github-signin {
		color: white !important;
		background: #303030;
	}

	#github-signin:hover {
		background: #373737;
	}
</style>