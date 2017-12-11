<template>
	<div class="container">
		<div class="row">
			<div class="col-xs-12 col-md-10 col-lg-9">
				<h1>Create OAuth 2.0 client</h1>
				<form @submit.prevent="create">
					<input class="form-control" placeholder="Name, pick an intuitive one" v-model="name" ref="nameInput">
					<input class="form-control" placeholder="Redirect URL, the one we redirect the user to after auth" v-model="redirectUrl">
					<button class="btn btn-primary" type="submit" ref="createBtn">Create client</button>
					<loader v-if="loading"/>
					<div class="alert alert-danger" id="errors" v-if="errors">
						<span v-if="errors.length === 1">{{errors[0]}}</span>
						<ul v-if="errors.length > 1">
							<li v-for="error in errors">{{error}}</li>
						</ul>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	export default {
		data: function () {
			return {
				name: '',
				redirectUrl: '',
				loading: false,
				errors: false,
			};
		},

		mounted: function() {
			this.$refs.nameInput.focus();
		},

		methods: {
			create: function() {
				this.$refs.createBtn.disabled = true;
				this.errors = false;
				this.loading = true;

				axios.post('/oauth/clients', {
					name: this.name,
					redirect: this.redirectUrl,
				}).then(response => {
					this.$router.push({name: 'settings.oauth2'});
				}).catch(error => {
					this.loading = false;
					
					if (error.response) {
						if (error.response.status === 422) {
							this.errors = [
								...(error.response.data.name || []),
								...(error.response.data.redirect || []),
							];
						}
					} else {
						this.errors = ['Network error!'];
					}

					this.$refs.createBtn.disabled = false;
				});
			}
		},

		head: {
			title: {
				inner: 'Create a new OAuth 2.0 client',
			},

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>

<style type="text/css" scoped>
	form > * {
		margin-top: 24px;
	}

	#errors ul {
		margin: 0;
	}
</style>