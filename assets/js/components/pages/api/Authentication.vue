<template>
	<div class="container">
		<div class="row">
			<div class="col-xs-12 col-4 order-xs-1 order-2">
				<sidenav></sidenav>
			</div>
			<div class="col-xs-12 col-8 order-xs-2 order-1" v-html="parsed">
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import Sidenav from './Sidenav.vue';

	export default {
		data: function() {
			return {
				parsed: marked(`
Authentication
================

Authentication with our API is simple. (or as simple as you want it to be)

You can either [create an OAuth 2.0 client](/settings/oauth2) for your application, or [create a personal access token](/settings/personal-access-tokens) for simpler uses. Use OAuth 2.0 when you have a web application and use the PAT when you have a tool/script that is going to consume the API.

Authentication happens in HTTP's \`Authorization\` header, and here's how you would send the header:

\`\`\`
Bearer <token>
\`\`\`

If you happen to access a protected route while being unauthenticated, you'll get something like this:

\`\`\`
{
  "error": "Unauthenticated."
}
\`\`\`

Nothing special, we've all done this before. Move on to the next section.
				`)
			};
		},

		components: {
			'sidenav': Sidenav,
		},

		meta: {
			title: 'Authentication - API',

			meta: [
				{name: 'description', content: 'Learn how to easily authenticate to our API using personal access tokens or OAuth 2.0 application tokens'},
				{property: 'og:title', content: 'Authentication in CodeBottle\'s API'},
				{property: 'og:description', content: 'Learn how to easily authenticate to our API using personal access tokens or OAuth 2.0 application tokens'},
			],
		},

		mounted: function() {
			document.querySelectorAll('pre code:not(.hljs)').forEach(b => {
				hljs.highlightBlock(b);
			});
		},
	};
</script>
