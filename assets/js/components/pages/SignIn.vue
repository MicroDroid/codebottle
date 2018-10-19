<template>
	<div class="container">
		<div class="mini-container text-center mx-auto mt-5">
			<h1>Welcome back!</h1>
			<br/>
			<form @submit.prevent="login">
				<div class="input-group">
					<span class="input-group-prepend">
						<span class="fas fa-user input-group-text"></span>
					</span>
					<input type="text" class="form-control" placeholder="Username" name="username" v-model="username" ref="usernameInput">
				</div>
				<div class="input-group">
					<span class="input-group-prepend">
						<span class="fas fa-key input-group-text"></span>
					</span>
					<input type="password" class="form-control" placeholder="Password" name="password" v-model="password">
				</div>
				<br/>
				<button class="btn btn-primary signin-btn w-100" type="submit" :disabled="loading">Sign in</button>
				<router-link :to="{name: 'github-signin'}" class="mt-2 btn btn-default github-signin-btn w-100" tag="button">
					Sign in with GitHub
				</router-link>
			</form>
			<br/>
			<p>
				New user? <router-link :to="{name: 'signup'}">Register now</router-link> <br/>
				Or, forgot your password? <router-link :to="{name: 'forgot-password'}">No problem</router-link>
			</p>
			<br/>
			<loader v-if="loading"/>
			<div class="alert alert-danger" v-if="error">{{error}}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {extractError} from '../../helpers';

	export default {
		data: () => ({
			loading: false,
			error: false,

			username: '',
			password: '',
		}),

		methods: {
			login() {
				this.error = false;
				this.loading = true;

				const credentials = {
					username: this.username,
					password: this.password,
				};

				this.$store.dispatch('auth/login', credentials)
					.then(async () => {
						await this.$store.dispatch('users/fetchSelf');
						await this.$store.dispatch('auth/fetchPreferences');
						this.$router.push({name: 'discover'});
					}).catch(error => {
						this.loading = false;
						this.error = extractError(error);
					});
			},
		},

		meta: {
			title: 'Sign in',

			meta: [
				{name: 'robots', content: 'noindex'},
				{property: 'og:title', content: 'Sign in'},
				{property: 'og:description', content: 'Sign in back to your account to get the most out of CodeBottle. Use social buttons for an instantaneous sign in.'},
			],
		},

		mounted: function() {
			this.$refs.usernameInput.focus();
		}
	};
</script>

<style lang="scss" scoped>
	.mini-container {
		max-width: 340px;
	}

	.signin-btn {
		text-transform: uppercase;
	}

	.github-signin-btn {
		color: white !important;
		background: #303030;

		&:hover {
			background: #373737;
		}
	}
</style>