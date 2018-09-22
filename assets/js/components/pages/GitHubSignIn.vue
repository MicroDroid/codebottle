<template>
	<div>
		<h3>Please wait..</h3>
	</div>
</template>

<script type="text/javascript">
	import {extractError, findGetParameter, genRandomString, cookGetParameters, cookToast} from '../../helpers';

	export default {
		meta: {
			title: 'Please wait..',

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

				this.$store.dispatch('auth/githubLogin', {
					state: originalState,
					code
				}).then(() => {
					this.$router.push({name: 'discover'});
				}).catch(error => {
					cookToast(extractError(error), 3000);
					this.$router.push({name: 'signin'});
				});
			} else {
				const state = genRandomString(24);
				localStorage.setItem('github_oauth_state', btoa(state));
				
				window.location = 'http://github.com/login/oauth/authorize?' + cookGetParameters({
					client_id: process.env.OAUTH_GITHUB_CLIENT_ID,
					redirect_uri: process.env.OAUTH_GITHUB_REDIRECT_URI,
					scope: 'user:email',
					state
				});
			}
		}
	};
</script>
