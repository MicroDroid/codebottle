<template>
	<div class="container">
		<div class="row">
			<div class="col-xs-12 col-md-10 col-lg-9">
				<h1>Edit OAuth 2.0 client</h1>
				<form @submit.prevent="save">
					<input class="form-control" placeholder="Name, pick an intuitive one" v-model="name" ref="nameInput">
					<input class="form-control" placeholder="Redirect URL, the one we redirect the user to after auth" v-model="redirectUrl">
					<button class="btn btn-primary" type="submit" ref="saveBtn">Save</button>
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
	import {cookToast} from '../../../../helpers';

	export default {
		data: function () {
			return {
				name: '',
				redirectUrl: '',
				loading: false,
				errors: false,
			};
		},

		beforeRouteEnter: function(to, from, next) {
			axios.get('/oauth/clients')
				.then(response => {
					const client = response.data.filter(client => client.id == to.params.id)[0];
					
					if (!client) {
						cookToast('Client not found', 2000);
					} else {
						next(vm => {
							vm.name = client.name;
							vm.redirectUrl = client.redirect;
						});
					}
				}).catch(error => {
					cookToast('Error!', 2000);
				});
		},

		mounted: function() {
			this.$refs.nameInput.focus();
		},

		methods: {
			save: function() {
				this.$refs.saveBtn.disabled = true;
				this.errors = false;
				this.loading = true;

				axios.put('/oauth/clients/' + this.$route.params.id, {
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

					this.$refs.saveBtn.disabled = false;
				});
			}
		},

		meta: {
			title: 'Edit OAuth 2.0 client',

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