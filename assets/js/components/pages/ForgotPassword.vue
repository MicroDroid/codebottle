<template>
	<div class="container">
		<div class="mini-container text-center mx-auto mt-5">
			<h1>Reset password</h1>
			<br>
			<form class="mt-2">
				<div class="input-group">
					<div class="input-group-prepend">
						<span class="fas fa-envelope input-group-text" />
					</div>
					<input type="email" class="form-control" placeholder="Email" name="email" v-model="email" ref="emailInput" required>
				</div>

				<br>

				<invisible-recaptcha sitekey="6Lf3UygUAAAAAMq-bXV5Q6eVzeHD-edRvYbF20bU" :validate="submit" :callback="resetPassword"
					class="btn btn-primary w-100" type="submit" :disabled="loading || sent">
					Submit
				</invisible-recaptcha>
			</form>
			<br>
			<br>
			
			<p>
				Did you remember it? <router-link :to="{name: 'signin'}">Try signing in then</router-link>
			</p>
			<br>
			<loader v-if="loading"/>
			<div class="alert alert-danger" v-if="error">{{error}}</div>
			<div class="alert alert-success" v-if="sent">A password reset email has been sent, if the email is valid</div>
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
			sent: false,

			email: '',
		}),

		methods: {
			submit() {
				this.error = false;
				this.loading = true;
			},

			resetPassword(recaptchaToken) {
				axios.post(apiUrl('/auth/password/reset'), {
					email: this.email,
					recaptcha_token: recaptchaToken,
				}).then(() => {
					this.loading = false;
					this.sent = true;
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				});
			}
		},

		mounted: function() {
			this.$refs.emailInput.focus();
		},

		meta: {
			title: 'Forgot password',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},

		components: {
			InvisibleRecaptcha,
		},
	};
</script>

<style lang="scss" scoped>
	.mini-container {
		max-width: 340px;
	}

	button[type='submit'] {
		text-transform: uppercase;
	}
</style>