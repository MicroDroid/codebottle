<template>
	<div class="container">
		<h1>{{ status }}</h1>
	</div>
</template>

<script type="text/javascript">
	import {apiUrl, extractError} from '../../helpers';
	
	export default {
		data() {
			return {
				status: 'Verifying your account…',
			};
		},

		mounted: function() {
			axios.post(apiUrl('/users/email-verifications'), {
				token: window.location.hash.substr(1),
			}).then(() => {
				this.$store.dispatch('toasts/addToast', {
					content: 'Email has been verified!',
					duration: 3000
				});
				this.$router.push({name: 'discover'});
			}).catch(error => {
				this.status = extractError(error);
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
