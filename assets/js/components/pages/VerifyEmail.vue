<template>
	<div class="container">
		<h1>Verifying your account..</h1>
	</div>
</template>

<script type="text/javascript">
	import {apiUrl} from '../../helpers';
	
	export default {
		mounted: function() {
			axios.post(apiUrl('/users/email-verifications'), {
				token: window.location.hash.substr(1),
			}).then(response => {
				this.$store.dispatch('toasts/addToast', {
					content: 'Email has been verified!',
					duration: 3000
				});
				this.$router.push({name: 'discover'});
			}).catch(error => {
				// idk, show something up
			});
		},

		meta: {
			title: 'Verifying email..',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>
