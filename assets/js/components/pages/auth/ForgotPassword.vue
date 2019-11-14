<template>
	<div class="container">
		<div class="mini-container text-center mx-auto mt-5">
			<h1>Reset password</h1>

			<form class="mt-5">
				<div class="input-group">
					<div class="input-group-prepend">
						<span class="fas fa-envelope input-group-text" />
					</div>
					<input ref="emailInput" v-model="email" type="email" class="form-control"
						placeholder="Email" name="email" required>
				</div>

				<invisible-recaptcha :disabled="loading || sent" :validate="submit" :callback="resetPassword" type="submit"
					class="btn btn-primary w-100 mt-3"
					sitekey="6Lf3UygUAAAAAMq-bXV5Q6eVzeHD-edRvYbF20bU">
					Submit
				</invisible-recaptcha>
			</form>

			<p class="mt-5">
				Did you remember it? <router-link :to="{name: 'signin'}">Try signing in then</router-link>
			</p>

			<loader v-if="loading" class=" mt-5"/>
			<div v-if="error" class="alert alert-danger mt-5">{{ error }}</div>
			<div v-if="sent" class="alert alert-success mt-5">A password reset email has been sent, if the email is valid</div>
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
			sent: false,

			email: '',
		}),

		mounted: function() {
			this.$refs.emailInput.focus();
		},

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

		meta: {
			title: 'Forgot password',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
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