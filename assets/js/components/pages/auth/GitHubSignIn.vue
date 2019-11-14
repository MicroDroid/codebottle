<template>
	<div class="container">
		<h3>Please wait..</h3>
	</div>
</template>

<script type="text/javascript">
	import {extractError, findGetParameter, genRandomString, cookGetParameters} from '../../../helpers';

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
					return this.$store.dispatch('toasts/addToast', {
						content: 'State mismatch error',
						duration: 3000
					});

				localStorage.removeItem('github_oauth_state');

				this.$store.dispatch('auth/githubLogin', {
					state: originalState,
					code
				}).then(async () => {
					await this.$store.dispatch('users/fetchSelf');
					await this.$store.dispatch('auth/fetchPreferences');
					try {
						const oldRoute = JSON.parse(localStorage.getItem('signin_old_route'));
						localStorage.removeItem('signin_old_route');
						this.$router.push(oldRoute || {name: 'discover'});
					} catch (error) {
						this.$router.push({name: 'discover'});
					}
				}).catch(error => {
					localStorage.removeItem('signin_old_route');
					this.$store.dispatch('toasts/addToast', {
						content: extractError(error),
						duration: 3000
					});
					this.$router.push({name: 'signin'});
				});
			} else {
				const state = genRandomString(24);
				localStorage.setItem('github_oauth_state', btoa(state));
				localStorage.setItem('signin_old_route', JSON.stringify(this.$route.params.oldRoute));

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
