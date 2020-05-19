<template>
	<div class="container">
		<div class="row">
			<div class="col-12 col-md-3">
				<sidenav />
			</div>
			<div class="col-12 col-md-9">
				<h4 class="mb-4">
					Download account data
				</h4>
				<p>
					You can download all of your data on CodeBottle using the button below.
				</p>

				<button :disabled="loading" class="btn btn-primary" type="button" @click="downloadData">
					Download data
				</button>

				<h4 class="mb-4 mt-5">
					Delete account
				</h4>
				<p>
					This action deletes your account, including:
				</p>
				<ul>
					<li>Snippets</li>
					<li>Snippet votes</li>
					<li>Snippet flags</li>
					<li>Authentication data</li>
				</ul>
				<p>
					This action is <strong>permanent</strong> and cannot be un-done.
				</p>


				<button :disabled="loading" class="btn btn-primary" type="button" @click="deleteAccount">
					Delete account
				</button>
				
				<loader v-if="loading" class="mt-5" />
				<div v-if="message" class="alert alert-success text-center mt-5">{{ message }}</div>
				<div v-if="error" class="alert alert-danger text-center mt-5">{{ error }}</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import { extractError, apiUrl } from '../../../helpers';
	import Sidenav from './Sidenav';
	import { saveAs } from 'file-saver';
	import { mapState } from 'vuex';

	export default {
		components: {
			'sidenav': Sidenav,
		},

		data() {
			return {
				loading: false,
				message: null,
				error: null,
			};
		},

		asyncData: function(store) {
			return store.dispatch('auth/fetchPreferences');
		},

		computed: {
			...mapState({
				self: state => state.users.self,
			}),
		},

		methods: {
			deleteAccount() {
				if (!confirm('Are you sure?'))
					return;

				axios.delete(apiUrl(`/users/${this.self.username}`)).then(response => {
					this.$store.dispatch('auth/logout');
					window.location = '/';
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				});
			},

			downloadData() {
				axios.get(apiUrl(`/users/${this.self.username}/data`)).then(response => {
					const filename = `${this.self.username}.json`;

					const blob = new Blob([JSON.stringify(response.data)], {
						type: 'application/json',
						name: filename,
					});

					saveAs(blob, filename);
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				});
			},
		},

		meta: {
			title: 'Account management',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>

<style lang="scss" scoped>
</style>