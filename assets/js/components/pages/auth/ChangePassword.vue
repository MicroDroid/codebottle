<template>
	<div class="container">
		<div class="mini-container text-center mx-auto mt-5">
			<h1>Change password</h1>

			<form class="mt-5" @submit.prevent="changePassword">
				<div class="input-group">
					<div class="input-group-prepend">
						<span class="fas fa-key input-group-text" />
					</div>
					<input ref="passwordInput" v-model="password" type="password" class="form-control"
						placeholder="New password" name="password" required>
				</div>

				<button :disabled="loading" class="btn btn-primary w-100 mt-4" type="submit">Submit</button>
			</form>

			<loader v-if="loading" class="mt-5"/>
			<div v-if="error" class="alert alert-danger mt-5">{{ error }}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {extractError, apiUrl} from '../../../helpers';

	export default {
		data: () => ({
			loading: false,
			error: false,

			password: '',
		}),

		mounted: function() {
			this.$refs.passwordInput.focus();
		},

		methods: {
			changePassword() {
				this.error = false;
				this.loading = true;

				axios.post(apiUrl('/auth/password/change'), {
					token: this.$route.hash.substring(1),
					password: this.password,
				}).then(() => {
					this.loading = false;
					this.$router.push({name: 'signin'});
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				});
			}
		},

		meta: {
			title: 'Change password',

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