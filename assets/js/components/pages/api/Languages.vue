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
Languages
================

### Schema

Here's what each language object looks like:

\`\`\`
{
    "id": 1,         // Integer
    "name": "Java"   // String
}
\`\`\`

### End-points

Retrieve all languages by calling \`GET /languages\`, that returns an array of languages. Here's an example response:

\`\`\`
{
    "data": [
        {
            "id": 1,
            "name": "Java"
        },
        {
            "id": 2,
            "name": "C/C++"
        },
        {
            "id": 3,
            "name": "C#"
        },
        ...
    ]
}
\`\`\`

You can also get a single language by its ID with \`GET /languages/{language_id}\`, for example \`GET /languages/1\` returns:

\`\`\`
{
    "data": {
        "id": 1,
        "name": "Java"
    }
}
\`\`\`
				`)
			};
		},

		components: {
			'sidenav': Sidenav,
		},

		head: {
			title: {
				inner: 'Languages - API',
			},

			meta: [
				{name: 'description', content: 'Languages classify snippets, making it easy to reach the snippet that speaks the language of your project\'s'},
				{property: 'og:title', content: 'Languages in CodeBotte\'s API'},
				{property: 'og:description', content: 'Languages classify snippets, making it easy to reach the snippet that speaks the language of your project\'s'},
			],
		},

		mounted: function() {
			$('pre code:not(.hljs)').each((i, b) => {
				hljs.highlightBlock(b);
			});
		},
	};
</script>
