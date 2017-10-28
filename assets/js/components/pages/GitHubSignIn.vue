<template>
	<div>
		<h3>Please wait..</h3>
	</div>
</template>

<script type="text/javascript">
	import {apiUrl, extractError, findGetParameter, genRandomString, cookGetParameters, cookToast} from '../../helpers';

	export default {
		data: function() {
			return {
				GITHUB_CLIENT_ID: process.env.NODE_ENV === 'production' ? '621e357ad57133607c33' : '0d1b8a8f60c5e2070c45',
			}
		},

		head: {
			title: {
				inner: "Please wait..",
			},

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},

		mounted: function() {
			const code = findGetParameter('code');

			if (code) {
				const originalState = atob(localStorage.getItem('github_oauth_state'));
				if (originalState !== findGetParameter('state'))
					return cookToast('State mismatch error', 3000);

				localStorage.removeItem('github_oauth_state');

				this.$store.dispatch('githubLogin', {
					state: originalState,
					code
				}).then(() => {
					this.$router.push({name: 'search'});
				}).catch(error => {
					cookToast(extractError(error), 3000);
					this.$router.push({name: 'signin'});
				});
			} else {
				const state = genRandomString(24);
				localStorage.setItem('github_oauth_state', btoa(state));
				window.location = 'http://github.com/login/oauth/authorize?' + cookGetParameters({
					client_id: this.GITHUB_CLIENT_ID,
					scope: 'user:email',
					state
				});
			}
		}
	}
</script>
