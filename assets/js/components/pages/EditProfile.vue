<template>
	<div class="container">
		<div class="col-xs-12 col-md-7">
			<h1>Edit profile</h1>
			<br>
			<form @submit.prevent="save" class="mb-5">
				<div class="form-group">
					<label for="username">Username</label>
					<input id="username" type="text" class="form-control" v-model="user.username" placeholder="Username" autofocus required>
				</div>

				<div class="form-group">
					<label for="email">Email</label>
					<input id="email" type="email" class="form-control" v-model="user.email" placeholder="Email" required>
				</div>

				<div class="form-group">
					<label for="bio">Bio</label>
					<textarea id="bio" type="text" class="form-control" v-model="user.bio" placeholder="A short bio about yourself" />
				</div>
				<button class="btn btn-primary" type="submit" :disabled="loading">Save</button>
			</form>

			<loader v-if="loading" />
			<div class="alert alert-success text-center" v-if="message">{{message}}</div>
			<div class="alert alert-danger text-center" v-if="error">{{error}}</div>
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

		asyncData: function(store, route) {
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
				}).then(response => {
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