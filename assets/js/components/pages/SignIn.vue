<template>
	<div class="container">
		<div id="mini-container">
			<h1>Welcome back!</h1>
			<br/>
			<form @submit.prevent="login">
				<div class="input-group">
					<span class="input-group-addon">
						<span class="fa fa-user"></span>
					</span>
					<input type="text" class="form-control" placeholder="Username" name="username" v-model="username" ref="usernameInput">
				</div>
				<div class="input-group">
					<span class="input-group-addon">
						<span class="fa fa-key"></span>
					</span>
					<input type="password" class="form-control" placeholder="Password" name="password" v-model="password">
				</div>
				<br/>
				<button class="btn btn-primary" type="submit" id="signin-btn" :disabled="loading">Sign in</button>
				<router-link :to="{name: 'github-signin'}" class="mt-2 btn btn-default" id="github-signin" tag="button">
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
	import store from '../../store';

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

				this.$store.dispatch('login', credentials)
					.then(() => {
						this.$router.push({name: 'discover'});
						store.dispatch('fetchPreferences');
					}).catch(error => {
						this.loading = false;
						this.error = extractError(error);
					});
			},
		},

		head: {
			title: {
				inner: 'Sign in',
			},

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

<style type="text/css" scoped>
	#mini-container {
		max-width: 340px;
		text-align: center;
		margin: auto;
		margin-top: 84px;
	}

	#signin-btn {
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