<template>
	<div class="container">
		<h1>Verifying your account..</h1>
	</div>
</template>

<script type="text/javascript">
	import {apiUrl, cookToast} from '../../helpers';
	
	export default {
		mounted: function() {
			axios.post(apiUrl('/users/email-verifications'), {
				token: window.location.hash.substr(1),
			}).then(response => {
				cookToast('Email has been verified!', 3000);
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

<style type="text/css" scoped>

</style>