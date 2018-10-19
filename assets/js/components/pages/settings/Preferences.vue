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
					<input id="indentation-size" type="number" class="form-control form-control-sm ml-2 d-inline" max="8" min="2"
						v-model="preferences.indentationSize">
						
					<div class="form-check mt-2">
						<input type="checkbox" class="form-check-input" v-model="preferences.convertTabsToSpaces">
						<label class="form-check-label">Auto-convert tabs to spaces</label>
					</div>

					<h4 class="mb-4 mt-4">Privacy</h4>

					<div class="form-check">
						<input type="checkbox" class="form-check-input" v-model="preferences.privateEmail">
						<label class="form-check-label">Hide email from profile</label>
					</div>

					<p class="text-muted last-changed mt-4">Last changed {{moment(preferences.updatedAt).fromNow()}}</p>
					<button class="btn btn-primary" type="submit" :disabled="loading">Save</button>
				</form>
				<br>
				<loader v-if="loading" />
				<div class="alert alert-success text-center" v-if="message">{{message}}</div>
				<div class="alert alert-danger text-center" v-if="error">{{error}}</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {extractError, apiUrl} from '../../../helpers';
	import Sidenav from './Sidenav';

	export default {
		data: function () {
			return {
				loading: false,
				error: false,
				message: false,
				preferences: {},
			};
		},

		asyncData: function(store, route) {
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
				}).then(response => {
					this.loading = false;
					this.preferences.updatedAt = Date.now();
					this.message = 'Saved!';
					this.$store.dispatch('auth/fetchPreferences').catch(error => {
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

		components: {
			'sidenav': Sidenav,
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