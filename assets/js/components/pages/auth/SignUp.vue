<template>
	<div class="container">
		<div id="mini-container" class="text-center mx-auto mt-5">
			<h1>Create an account</h1>

			<form class="mt-5">
				<div class="input-group">
					<span class="input-group-prepend">
						<div class="input-group-text">
							<span class="fas fa-fw fa-user" />
						</div>
					</span>
					<input v-model="username" type="text" class="form-control" placeholder="Username"
						autofocus>
				</div>
				<div class="input-group">
					<span class="input-group-prepend">
						<div class="input-group-text">
							<span class="fas fa-fw fa-envelope" />
						</div>
					</span>
					<input v-model="email" type="email" class="form-control" placeholder="Email">
				</div>
				<div class="input-group">
					<span class="input-group-prepend">
						<div class="input-group-text">
							<span class="fas fa-fw fa-key" />
						</div>
					</span>
					<input v-model="password" type="password" class="form-control" placeholder="Password">
				</div>

				<invisible-recaptcha id="signup-btn" :validate="submit" :callback="signup" :disabled="loading || created"
					class="btn btn-primary mt-4 w-100" type="submit"
					sitekey="6Lf3UygUAAAAAMq-bXV5Q6eVzeHD-edRvYbF20bU">
					Create account
				</invisible-recaptcha>
				<router-link id="github-signin" :to="{name: 'github-signin'}" class="mt-2 btn btn-default w-100" tag="button">
					Sign up with GitHub
				</router-link>
			</form>

			<p class="mt-5">
				Existing user? <router-link :to="{name: 'signin'}">Sign in here</router-link><br>
			</p>

			<loader v-if="loading" class="mt-5"/>
			<div v-if="error" class="alert alert-danger mt-5">{{ error }}</div>
			<div v-if="message" class="alert alert-success mt-5">{{ message }}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import InvisibleRecaptcha from 'vue-invisible-recaptcha';
	import {extractError, apiUrl} from '../../../helpers';

	export default {
		components: {
			InvisibleRecaptcha,
		},

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
				}).then(() => {
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