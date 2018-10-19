<template>
	<div class="container" v-if="snippet && revisions">
		<h2>{{snippet.title}}</h2>
		<h5 class="text-muted">{{snippet.revisions_count}} revisions</h5>
		<ul class="list-group" id="revisions">
			<router-link tag="li" v-for="(revision, index) in revisions" :key="revision.createdAt"
				:to="index+1 === revisions.length 
					? {name: 'view-snippet', params: {id: snippet.id}}
				: {name: 'view-snippet-revision', params: {snippet_id: snippet.id, id: index+1}}"
				class="clickable list-group-item d-flex justify-content-between align-items-center" exact>
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
							{{index === 0 ? 'Initial revision' : revision.explanation}}
						</p>
					</div>
				</div>
				<div>
					<span class="badge badge-primary mr-2" v-if="index+1 === revisions.length">Current</span>
					<span class="text-muted">
						{{ moment(revision.createdAt).fromNow() }} / 
						{{ index === 0 ? 'Original' : diffLines(revisions[index-1].code, revision.code).map(o => o.value).join('').split('\n').length + ' changes' }}
					</span>
				</div>
			</router-link>
		</ul>
	</div>
</template>

<script type="text/javascript">
	import striptags from 'striptags';
	import {diffLines} from 'diff';
	import {mapGetters} from 'vuex';
	import {getAbsoluteUrl, extractError} from '../../helpers';

	export default {
		methods: {
			diffLines,
			moment: moment.utc
		},

		computed: {
			...mapGetters({
				snippetById: 'snippets/getById',
				userByUsername: 'users/getByUsername',
			}),

			snippet: function() {
				return this.snippetById(this.$route.params.snippet_id);
			},

			revisions: function() {
				return this.snippetById(this.$route.params.snippet_id).revisions;
			},
		},

		asyncData: function(store, route) {
			return store.dispatch('snippets/fetch', route.params.snippet_id).then(() => {
				return store.dispatch('snippets/fetchRevisions', route.params.snippet_id).then(revisions => {
					const authors = [];
					const promises = [];
					
					for (let revision of revisions) {
						if (authors.indexOf(revision.author) === -1) {
							promises.push(store.dispatch('users/fetch', revision.author));
							authors.push(revision.author);
						}
					}

					return Promise.all(promises);
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
			const description = striptags(marked(this.snippet && this.snippet.description ? this.snippet.description : 'No description provided.'), '<pre>');
			return {
				title: this.snippet
					? 'Revisions: ' + this.snippet.title
					: 'Snippet revisions',
				meta: [
					{name: 'robots', content: 'noindex'},
					{name: 'description', content: description ? description : 'No description provided.'},
					{property: 'og:description', content: description ? description : 'No description provided.'},
					{property: 'og:title', content:  this.snippet
						? 'Revisions: ' + this.snippet.title
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
</style>
