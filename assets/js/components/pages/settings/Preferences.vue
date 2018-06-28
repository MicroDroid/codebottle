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
					<input type="number" id="indentation-size" class="form-control form-control-sm ml-2" max="8" min="2"
						v-model="preferences.indentationSize">
					<br>
					<label class="custom-control custom-checkbox mt-2">
						<input type="checkbox" class="custom-control-input" v-model="preferences.convertTabsToSpaces">
						<span class="custom-control-indicator" />
						<span class="custom-control-description">Auto-convert tabs to spaces</span>
					</label>
					<h4 class="mb-4 mt-4">Privacy</h4>
					<label class="custom-control custom-checkbox">
						<input type="checkbox" class="custom-control-input" v-model="preferences.privateEmail">
						<span class="custom-control-indicator" />
						<span class="custom-control-description">Hide email from profile</span>
					</label>
					<p class="text-muted mt-4" id="last-changed">Last changed {{moment(preferences.updatedAt).fromNow()}}</p>
					<button class="btn btn-primary" type="submit" :disabled="loading">Save</button>
				</form>
				<br>
				<loader v-if="loading" />
				<div class="alert alert-success center-text" v-if="message">{{message}}</div>
				<div class="alert alert-danger center-text" v-if="error">{{error}}</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {extractError, apiUrl, cookToast} from '../../../helpers';
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
						cookToast('Error reloading preferences!', 3000);
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

<style type="text/css" scoped>
	#last-changed {
		font-size: 14px;
	}

	#indentation-size {
		display: inline;
		max-width: 72px;
	}
</style>