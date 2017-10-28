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
				parsed: marked(
`
Getting Started
===============

> We're very happy to see you use our API! However, this API is still very experimental and changes are very likely to happen and without notice. Please use this API wisely until we come to a stable

<!-- separator -->
> This API is for **personal use only**. For any commercial use of this API, please contact us.

CodeBottle's API is a very simple, quota-less, JSON RESTful API.

The base URL is \`https://api.codebottle.io/\`.

### Required headers

The API requires you to set the \`Accept\` header to:

\`\`\`JSON
application/vnd.codebottle+json
\`\`\`

With this header set, the latest version of the API will be served. You can also request a specific version of the API. For example, if you wanted to query the \`v1\` API, you set the \`Accept\` to:

\`\`\`JSON
application/vnd.codebottle.v1+json
\`\`\`

**We generally *highly* recommend you to be explicit about the version of the API you are try to use so that API changes do not break your existing application.**

### Basic schema

The API as mentioned is JSON. A successful request with status code of \`204\` return no response. No data will be returned and you should not parse the response.

If the successful request has a status code of \`200\`, the response will be like:

\`\`\`JSON
{
	data: ...
}
\`\`\`

If the response however, happens to be an error, the response will look like:

\`\`\`JSON
{
	error: "...", // Human readable error
}
\`\`\`

Good read! Now head to the next section.
`
)
			}
		},

		components: {
			'sidenav': Sidenav,
		},

		head: {
			title: {
				inner: "Getting Started - API",
			},

			meta: [
				{name: 'description', content: 'Get started quickly into using our quota-less free API and integrate it with your application'},
                {property: 'og:title', content: 'Getting started in CodeBottle\'s API'},
                {property: 'og:description', content: 'Get started quickly into using our quota-less free API and integrate it with your application'},
			],
		},

		mounted: function() {
			$("pre code:not(.hljs)").each((i, b) => {
				hljs.highlightBlock(b);
			});
		},
	}
</script>
