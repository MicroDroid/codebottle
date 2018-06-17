<template>
	<div class="container">
		<div id="mini-container">
			<h1>Change password</h1>
			<br/>
			<form @submit.prevent="changePassword">
				<div class="input-group">
					<span class="input-group-addon">
						<span class="fas fa-key"></span>
					</span>
					<input type="password" class="form-control" placeholder="New password" name="password" id="password" v-model="password" ref="passwordInput" required>
				</div>
				<br/>
				<button class="btn btn-primary" type="submit" id="submit-btn" :disabled="loading">Submit</button>
			</form>
			<br/>
			<br/>
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
					token: this.$route.query.token,
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
</style>