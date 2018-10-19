<template>
	<div class="container">
		<div class="mini-container text-center mx-auto mt-5">
			<h1>Change password</h1>
			<br>
			<form @submit.prevent="changePassword" class="mt-2">
				<div class="input-group">
					<div class="input-group-prepend">
						<span class="fas fa-key input-group-text" />
					</div>
					<input type="password" class="form-control" placeholder="New password" name="password" ref="passwordInput" v-model="password" required>
				</div>
				<br>
				<button class="btn btn-primary w-100" type="submit" :disabled="loading">Submit</button>
			</form>
			<br>
			<br>
			<loader v-if="loading"/>
			<div class="alert alert-danger" v-if="error">{{error}}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {extractError, apiUrl} from '../../helpers';

	export default {
		data: () => ({
			loading: false,
			error: false,

			password: '',
		}),

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

		mounted: function() {
			this.$refs.passwordInput.focus();
		}
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