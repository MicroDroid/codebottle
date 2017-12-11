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
Snippets
===============

Snippets are at the core of CodeBottle, and so there's a bunch of end-points associated with snippets. Let's go through them!

### Schema

So what does a snippet look like? That:

\`\`\`
{
    "id": "560674d74d",
    "username": "fancyusername",
    "category": {
        "id": 3,
        "name": "Free lines"
    },
    "language": {
        "id": 6,
        "name": "JavaScript"
    },
    "title": "Some fancy title",
    "description": "Some fancy description",
    "code": "console.log('some fancy code');",
    "views": 3,
    "created_at": "2017-05-28 21:22:41",
    "updated_at": "2017-05-28 21:22:41",
    "votes": 0,
    "updates": 0
}
\`\`\`

Snippets, unlike most of everything, have string unique IDs rather than integer ones. \`username\` is the username of the owner user. \`language\` and \`category\` are language and category objects (See their own reference)

\`title\` is length-limited, while \`description\` is not. If the user includes markdown in their description, then, well, \`description\` will contain the markdown as well. You need to parse that. \`code\` is also limitless (to an extent)

\`views\` is a rate-limited views count. \`created_at\` and \`updated_at\` are dates of creation and update, respectively, in UTC. If \`updated_at\` is identical to \`created_at\`, then the snippet was never edited. \`updates\` Reflects the number of updates done to the snippet.

\`votes\` is the sum of down and upvotes for the given snippet, and, if you're doing the request while being authenticated, you'll get an extra field called \`current_vote\`, which reflects your current vote. Can be \`-1\`, \`0\`, and \`+1\`


### Searching snippets

The end-point is \`GET /snippets\`, and takes these parameters:

| Parameter  | Required? | Description                             | Example           |
|------------|-----------|-----------------------------------------|-------------------|
| \`keywords\` | Yes       | Keywords to be matched against snippets | \`Truncate string\` |
| \`language\` | No        | The ID of the language to search for    | \`1\`               |

and there's an example response:

\`\`\`
{
    "data": [
        {
            "id": "560674d74d",
            "username": "fancyusername",
            "category": {
                "id": 3,
                "name": "Free lines"
            },
            "language": {
                "id": 6,
                "name": "JavaScript"
            },
            "title": "Some fancy title",
            "description": "Some fancy description",
            "code": "console.log('some fancy code');",
            "views": 3,
            "created_at": "2017-05-28 21:22:41",
            "updated_at": "2017-05-28 21:22:41",
            "votes": 0,
        },
        ...
    ]
}
\`\`\`

The fields show in the example response above are available in this end-point. [Getting a specific snippet by ID](#getting-a-snippet-by-id) will return more data.

The end-point will return up to 10 results. \`data\` will be \`[]\` if no snippets are found.

Here's the list of errors this end-point might throw:

| HTTP status | Error message        |
|-------------|----------------------|
| 422         | Invalid language     |
| 422         | No keywords provided |
| 422         | Keywords too short   |

### Getting latest snippets

We have implemented an end-point to get the latest 50 snippets to help create feeds and browse sections.

The end-point is \`GET /snippets/new\`, and takes no parameters, throws no errors, and the response schema is identical to the search one.

### Getting a snippet by ID

You can get a specific snippet by its ID, use this end-point to also get fields that are not sent in other (like search) end-points.

The end-point is \`GET /snippets/{snippet_id}\`, and will return a snippet object, or throw a \`404\` if not found.

There's an example response:

\`\`\`
{
    "data": {
        "id": "560674d74d",
        "username": "fancyusername",
        "category": {
            "id": 3,
            "name": "Free lines"
        },
        "language": {
            "id": 6,
            "name": "JavaScript"
        },
        "title": "Some fancy title",
        "description": "Some fancy description",
        "code": "console.log('some fancy code');",
        "views": 3,
        "created_at": "2017-05-28 21:22:41",
        "updated_at": "2017-05-28 21:22:41",
        "votes": 0,
        "updates": 0
    }
}
\`\`\`

The end-point takes no parameters and throws no errors (other than 404)

### Creating snippets

The end-point is \`POST /snippets\`, and **requires authentication** and takes these parameters:

| Parameter     | Required? | Description                    | Example                         |
|---------------|-----------|--------------------------------|---------------------------------|
| \`title\`       | Yes       | The title of the snippet       | \`Truncate string preserve word\` |
| \`description\` | Yes       | Markdown-supported description | \`Some _whatever_ description\`   |
| \`code\`        | Yes       | ..code?                        | \`some_code()\`                   |
| \`language\`    | Yes       | The ID of the language         | \`1\`                             |
| \`category\`    | Yes       | The ID of the category         | \`1\`                             |

and might throw these errors:

| HTTP status | Error message             |
|-------------|---------------------------|
| 422         | Title field is required   |
| 422         | Code field is required    |
| 422         | Invalid language selected |
| 422         | Invalid category selected |

The end-point, if succeeded, returns the snippet model itself.

### Voting snippets

This end-point **requires authentication**, and is \`POST /snippets/{snippet_id}/vote\`

Takes these parameters:

| Parameter | Required? | Description                               | Example |
|-----------|-----------|-------------------------------------------|---------|
| \`vote\`    | Yes       | Positive/Negative number for Up/down vote | \`1\`     |

And could throw these errors:

| HTTP status | Error message    |
|-------------|------------------|
| 422         | No vote provided |

Returns an empty response with \`204\` when succeeds.

## Updates

This feature hasn't been fully implemented and thus basically will stay undocumented for a while.
				`)
			};
		},

		components: {
			'sidenav': Sidenav,
		},

		head: {
			title: {
				inner: 'Snippets - API',
			},

			meta: [
				{name: 'description', content: 'Snippets are at the core of the website, yet see how quickly and easily you can get started with them with our simple API'},
				{property: 'og:title', content: 'Snippets in CodeBotte\'s API'},
				{property: 'og:description', content: 'Snippets are at the core of the website, yet see how quickly and easily you can get started with them with our simple API'},
			],
		},

		mounted: function() {
			$('pre code:not(.hljs)').each((i, b) => {
				hljs.highlightBlock(b);
			});

			$('table').addClass('table');
		},
	};
</script>
