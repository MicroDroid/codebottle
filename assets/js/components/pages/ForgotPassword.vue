<template>
	<div class="container">
		<div id="mini-container">
			<h1>Reset password</h1>
			<br/>
			<form>
				<div class="input-group">
					<span class="input-group-addon">
						<span class="fa fa-envelope"></span>
					</span>
					<input type="email" class="form-control" placeholder="Email" name="email" id="email" v-model="email" ref="emailInput" required>
				</div>
				<br/>

				<!-- <button class="btn btn-primary" type="submit" id="submit-btn" :disabled="loading || sent">Submit</button> -->

				<invisible-recaptcha sitekey="6Lf3UygUAAAAAMq-bXV5Q6eVzeHD-edRvYbF20bU" :validate="submit" :callback="resetPassword"
					class="btn btn-primary" type="submit" id="submit-btn" :disabled="loading || sent">
					Submit
				</invisible-recaptcha>
			</form>
			<br/>
			<br/>
			
			<p>
				Did you remember it? <router-link :to="{name: 'signin'}">Try signing in then</router-link>
			</p>
			<br/>
			<loader v-if="loading"/>
			<div class="alert alert-danger" v-if="error">{{error}}</div>
			<div class="alert alert-success" v-if="sent">A password reset email has been sent, if the email is valid</div>
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

		head: {
			title: {
				inner: 'Forgot password',
			},

			meta: [
				{name: 'robots', content: 'noindex'},
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

	form {
		margin-top: 12px;
	}

	#submit-btn {
		width: 100%;
		text-transform: uppercase;
	}

	.fa {
		width: 16px;
	}
</style>