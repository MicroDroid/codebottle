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
Categories
================

### Schema

Each category object looks like:

\`\`\`
{
    "id": 1,          // Integer
    "name": "Class"   // String
}
\`\`\`

### End-points

Get all categories by calling \`GET /categories\`. There's an example response:

\`\`\`
{
    "data": [
        {
            "id": 1,
            "name": "Class"
        },
        {
            "id": 2,
            "name": "Function"
        },
        {
            "id": 3,
            "name": "Free lines"
        }
    ]
}
\`\`\`

You can also retrieve a single category by its ID with \`GET /categories/{category_id}\`, for example \`GET /categories/1\` returns:

\`\`\`
{
    "data": {
        "id": 1,
        "name": "Class"
    }
}
\`\`\`
`
)
            }
        },

        components: {
            'sidenav': Sidenav,
        },

        head: {
            title: {
                inner: "Categories - API",
            },

            meta: [
                {name: 'description', content: 'Categories make it easy for plugins and scripts to determine the type of the snippet and import it properly'},
                {property: 'og:title', content: 'Categories in CodeBottle\'s API'},
                {property: 'og:description', content: 'Categories make it easy for plugins and scripts to determine the type of the snippet and import it properly'},
            ],
        },

        mounted: function() {
            $("pre code:not(.hljs)").each((i, b) => {
                hljs.highlightBlock(b);
            });
        },
    }
</script>
