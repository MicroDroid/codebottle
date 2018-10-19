<template>
	<div v-if="revision" class="container">
		<div class="list-group-item d-flex justify-content-between align-items-center">
			<div class="row no-gutters">
				<div class="col-auto">
					<router-link :to="{name: 'view-user', params: {username: revision.author}}">
						<img :src="userByUsername(revision.author).profileImage"
							width="48" alt="avatar">
					</router-link>
				</div>
				<div class="col ml-3">
					<router-link :to="{name: 'view-user', params: {username: revision.author}}" class="clickable mb-0 whiteLink">
						{{ revision.author }}
					</router-link>
					<p class="mb-0 text-muted">
						{{ $route.params.id-1 === 0 ? 'Initial revision' : revision.explanation }}
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
		<h2>{{ revision.title }}</h2>
		<p class="mb-2">
			<span>
				<span class="far fa-bullseye" />
				<span>{{ revision.category.name }}</span>
			</span>
			<span class="ml-2">
				<span class="far fa-code" />
				<span>{{ revision.language.name }}</span>
			</span>
		</p>
		<pre><code :style="{'tab-size': preferences.indentationSize}" :class="hljsLanguageById(revision.language.id)" class="p-3">{{ computedCode }}</code></pre>
		<div v-if="revision.description" class="card description">
			<div class="card-body">
				<div class="card-text" v-html="marked(revision.description)" />
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import striptags from 'striptags';
	import {diffLines} from 'diff';
	import {mapGetters} from 'vuex';
	import {getAbsoluteUrl, extractError, hljsLanguageById, highlightCode} from '../../helpers';

	export default {
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

		mounted: function() {
			highlightCode();
		},

		methods: {
			diffLines, marked, hljsLanguageById,
			moment: moment.utc,
		},

		asyncData: function(store, route) {
			return store.dispatch('snippets/fetch', route.params.snippet_id).then(() => {
				return store.dispatch('snippets/fetchRevisions', route.params.snippet_id).then(revisions => {
					return store.dispatch('users/fetch', revisions[route.params.id].author).catch(e => {
						store.dispatch('toasts/addToast', {
							content: extractError(e),
							duration: 3000
						});	
					});	
				}).catch(e => {
					store.dispatch('toasts/addToast', {
						content: extractError(e),
						duration: 3000
					});			
				});
			}).catch(e => {
				store.dispatch('toasts/addToast', {
					content: extractError(e),
					duration: 3000
				});
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

<style lang="scss" scoped>
	.description >>> img {
		max-width: 100%;
	}
</style>
