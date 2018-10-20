<template>
	<div class="container">
		<div class="col-12 col-md-7">
			<h1>Edit profile</h1>
			
			<form class="mt-4" @submit.prevent="save">
				<div class="form-group">
					<label for="username">Username</label>
					<input id="username" v-model="user.username" type="text" class="form-control"
						placeholder="Username" autofocus required>
				</div>

				<div class="form-group">
					<label for="email">Email</label>
					<input id="email" v-model="user.email" placeholder="Email" type="email"
						class="form-control" required>
				</div>

				<div class="form-group">
					<label for="bio">Bio</label>
					<textarea id="bio" v-model="user.bio" type="text" class="form-control"
						placeholder="A short bio about yourself" />
				</div>
				<button :disabled="loading" class="btn btn-primary" type="submit">Save</button>
			</form>

			<loader v-if="loading" />
			<div v-if="message" class="alert alert-success text-center mt-5">{{ message }}</div>
			<div v-if="error" class="alert alert-danger text-center mt-5">{{ error }}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {extractError, apiUrl} from '../../helpers';

	export default {
		data: function() {
			return {
				originalEmail: false,
				message: false,
				loading: false,
				error: false,
				user: {},
			};
		},

		asyncData: function(store) {
			return store.dispatch('users/fetchSelf');
		},

		mounted: function() {
			this.originalEmail = this.user.email;
			this.user = {...this.$store.state.users.self};
		},

		methods: {
			save: function() {
				this.error = false;
				this.message = false;
				this.loading = true;

				axios.put(apiUrl('/self'), {
					username: this.user.username,
					email: this.user.email,
					bio: this.user.bio
				}).then(() => {
					this.loading = false;
					this.$store.dispatch('users/fetchSelf');
					if (this.originalEmail !== this.email)
						this.message = 'Saved! We\'ve sent a verification email to your new email';
					else
						this.$router.push({name: 'view-user', params: {
							username: this.user.username
						}});
					this.originalEmail = this.email;
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				});
			}
		},

		meta: {
			title: 'Edit your profile',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>