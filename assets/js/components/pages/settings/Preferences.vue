<template>
	<div class="container">
		<div class="row">
			<div class="col-xs-12 col-md-3">
				<sidenav />
			</div>
			<div class="col-xs-12 col-md-9">
				<form @submit.prevent="save">
					<h4 class="mb-4">Code format</h4>
					<label for="indentation-size">Preferred indentation size</label>
					<input id="indentation-size" v-model="preferences.indentationSize" type="number"
						class="form-control form-control-sm ml-2 d-inline"
						max="8" min="2">
						
					<div class="form-check mt-2">
						<input v-model="preferences.convertTabsToSpaces" type="checkbox" class="form-check-input" >
						<label class="form-check-label">Auto-convert tabs to spaces</label>
					</div>

					<h4 class="mb-4 mt-4">Privacy</h4>

					<div class="form-check">
						<input v-model="preferences.privateEmail" type="checkbox" class="form-check-input">
						<label class="form-check-label">Hide email from profile</label>
					</div>

					<p class="text-muted last-changed mt-4">Last changed {{ moment(preferences.updatedAt).fromNow() }}</p>
					<button :disabled="loading" class="btn btn-primary" type="submit">Save</button>
				</form>
				<br>
				<loader v-if="loading" />
				<div v-if="message" class="alert alert-success text-center">{{ message }}</div>
				<div v-if="error" class="alert alert-danger text-center">{{ error }}</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {extractError, apiUrl} from '../../../helpers';
	import Sidenav from './Sidenav';

	export default {
		components: {
			'sidenav': Sidenav,
		},

		data: function () {
			return {
				loading: false,
				error: false,
				message: false,
				preferences: {},
			};
		},

		asyncData: function(store) {
			return store.dispatch('auth/fetchPreferences');
		},

		mounted: function() {
			this.preferences = {...this.$store.state.auth.preferences};
		},

		methods: {
			save: function() {
				this.error = false;
				this.message = false;
				this.loading = true;

				axios.put(apiUrl('/self/preferences'), {
					convert_tabs_to_spaces: this.preferences.convertTabsToSpaces,
					private_email: this.preferences.privateEmail,
					indentation_size: this.preferences.indentationSize,
				}).then(() => {
					this.loading = false;
					this.preferences.updatedAt = Date.now();
					this.message = 'Saved!';
					this.$store.dispatch('auth/fetchPreferences').catch(() => {
						this.$store.dispatch('toasts/addToast', {
							content: 'Error reloading preferences!',
							duration: 3000
						});
					});
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				});
			},

			moment: moment.utc,
		},

		meta: {
			title: 'Site preferences',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>

<style lang="scss" scoped>
	.last-changed {
		font-size: 0.875rem;
	}

	#indentation-size {
		max-width: 72px;
	}
</style>