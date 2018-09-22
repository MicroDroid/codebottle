<template>
	<div class="container">
		<h2>Support</h2>
		<p>
			Be it a bug report, a feature request, a simple feedback, or maybe you just want some help doing something. <br>
			Send to us and we will be very happy to help. &lt;3
		</p>
		<ul>
			<li>E-mail: <a ref="emailField" target="_blank"/></li>
			<li>Twitter: <a href="https://twitter.com/codebottle_io" target="_blank">@codebottle_io</a></li>
			<li>Discord: <a href="https://discord.gg/2Sd8Um3" target="_blank">https://discord.gg/2Sd8Um3</a></li>
		</ul>
	</div>
</template>

<script type="text/javascript">
	export default {
		data() {
			return {
				email: 'support@codebottle.io',
			};
		},

		mounted() {
			this.$refs.emailField.innerText = this.email;
			this.$refs.emailField.href = `mailto:${this.email}`;
		},

		meta: {
			title:'Support',

			meta: [
				{name: 'description', content: 'Something went wrong? Get to us quickly and we\'ll see if we can help.'},
				{property: 'og:title', content: 'Support'},
				{property: 'og:description', content: 'Something went wrong? Get to us quickly and we\'ll see if we can help.'},
			],
		},
	};
</script>
