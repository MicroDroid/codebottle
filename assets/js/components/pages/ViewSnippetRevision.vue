<template>
	<div class="container" v-if="revision">
		<div class="list-group-item d-flex justify-content-between align-items-center">
			<div class="row no-gutters">
				<div class="col-auto">
					<router-link :to="{name: 'view-user', params: {username: revision.author}}">
						<img :src="userByUsername(revision.author).profileImage"
							width="48" alt="avatar">
					</router-link>
				</div>
				<div class="col ml-3">
					<router-link class="clickable mb-0 whiteLink" :to="{name: 'view-user', params: {username: revision.author}}">
						{{revision.author}}
					</router-link>
					<p class="mb-0 text-muted">
						{{$route.params.id-1 === 0 ? 'Initial revision' : revision.explanation}}
					</p>
				</div>
			</div>
			<div>
				<span class="text-muted">
					{{ moment(revision.createdAt).fromNow() }} / 
					{{ $route.params.id-1 === 0 ? 'Original' : diffLines(revisions[$route.params.id-1].code, revision.code).map(o => o.value).join('').split('\n').length + ' changes' }}
				</span>
			</div>
		</div>
		<hr>
		<h2>{{revision.title}}</h2>
		<p id="stats-bar">
			<span>
				<span class="fa fa-bullseye"></span>
				<span>{{revision.category.name}}</span>
			</span>
			<span class="ml-2">
				<span class="fa fa-code"></span>
				<span>{{revision.language.name}}</span>
			</span>
		</p>
		<pre><code :class="hljsLanguageById(revision.language.id)" :style="{'tab-size': preferences.indentationSize}">{{ computedCode }}</code></pre>
		<div class="card" v-if="revision.description" id="description">
			<div class="card-body">
				<div class="card-text" v-html="marked(revision.description)">
				</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import striptags from 'striptags';
	import {diffLines} from 'diff';
	import {mapGetters} from 'vuex';
	import {getAbsoluteUrl, cookToast, extractError, hljsLanguageById} from '../../helpers';

	export default {
		methods: {
			diffLines, marked, hljsLanguageById,
			moment: moment.utc,
		},

		computed: {
			...mapGetters({
				snippetById: 'snippets/getById',
				userByUsername: 'users/getByUsername',
				preferences: 'auth/preferences',
			}),

			snippet: function() {
				return this.snippetById(this.$route.params.snippet_id);
			},

			revisions: function() {
				return this.snippetById(this.$route.params.snippet_id).revisions;
			},

			revision: function() {
				return this.revisions[this.$route.params.id-1];
			},

			computedCode: function() {
				if (this.preferences.convertTabsToSpaces)
					return this.revision.code.replace(/\t/g, Array(this.preferences.indentationSize + 1).join(' '));
				return this.revision.code;
			}
		},

		asyncData: function(store, route) {
			return store.dispatch('snippets/fetch', route.params.snippet_id).then(() => {
				return store.dispatch('snippets/fetchRevisions', route.params.snippet_id).then(revisions => {
					return store.dispatch('users/fetch', revisions[route.params.id].author).catch(e => {
						cookToast(extractError(e), 3000);	
					});	
				}).catch(e => {
					cookToast(extractError(e), 3000);			
				});
			}).catch(e => {
				cookToast(extractError(e), 3000);
			});
		},

		mounted: function() {
			document.querySelectorAll('pre code:not(.hljs)').forEach(b => {
				hljs.highlightBlock(b);
			});
		},

		meta: function() {
			const description = striptags(marked(this.revision ? this.revision.description : 'No description provided.'), '<pre>');
			return {
				title: this.revision
					? `Revision #${this.$route.params.id-1}: ${this.revision.title}`
					: 'Snippet revision',
				meta: [
					{name: 'robots', content: 'noindex'},
					{name: 'description', content: description ? description : 'No description provided.'},
					{property: 'og:description', content: description ? description : 'No description provided.'},
					{property: 'og:title', content:  this.revision
						? 'Revisions: ' + this.revision.title
						: 'Snippet revisions'},
					{property: 'og:url', content: getAbsoluteUrl(this.$route.path)},
				]
			};
		},
	};
</script>

<style type="text/css" scoped>
	#revisions {
		margin-top: 32px;
	}

	code {
		padding: 1.25rem;
	}

	#description >>> img {
		max-width: 100%;
	}

	#stats-bar {
		margin-bottom: 12px;
	}
</style>
