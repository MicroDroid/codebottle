<template>
	<div class="container">
		<div class="row" v-if="snippet" itemscope itemtype="http://schema.org/SoftwareSourceCode">
			<div class="col-xs-12 col-auto">
				<div id="voting-buttons">
					<span :class="{
						'fas': true,
						'fa-chevron-up': true,
						'clickable': true,
						'voted': snippet.currentVote && snippet.currentVote == 1
					}" @click="vote(1)" />
					<span itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
						<span itemprop="ratingValue">{{snippet.votes}}</span>
					</span>
					<span :class="'fas fa-chevron-down clickable'
						+ ((snippet.currentVote && snippet.currentVote == -1) ?
					' voted' : '')" @click="vote(-1)" />
				</div>
				<div id="action-bar">
					<button class="btn btn-info btn-sm" v-clipboard="computedCode" @click="showCopiedToast">
						<span class="far fa-copy" /> Copy
					</button>
					<router-link tag="button" class="btn btn-warning btn-sm"
						:to="{name: 'edit-snippet', params: {id: snippet.id}}" v-if="currentUsername === snippet.username">
						<span class="far fa-pencil" /> Edit
					</router-link>
					<button class="btn btn-danger btn-sm" @click="deleteSnippet" v-if="currentUsername === snippet.username">
						<span class="far fa-trash" /> Delete
					</button>
				</div>
			</div>
			<div class="col-xs-12 col" id="data-container">
				<h2 itemprop="about">
					{{snippet.title}}
					<a @click.prevent="flag" href="javascript:undefined" id="flag-btn"><span class="fas fa-flag" /></a>
				</h2>
				<div id="stats-bar" class="text-muted mb-2">
					<span>
						<span class="far fa-bullseye" />
						<span itemprop="codeSampleType">{{snippet.category.name}}</span>
					</span>
					<span class="ml-2">
						<span class="far fa-code" />
						<span itemprop="programmingLanguage">{{snippet.language.name}}</span>
					</span>
					<span class="ml-2">
						<span class="far fa-user" />
						<router-link :to="{name: 'view-user', params: {username: snippet.username}}" itemprop="author">
							{{snippet.username}}
						</router-link>
					</span>
					<span class="ml-2">
						<span class="far fa-sync" />
						<span>
							<router-link :to="{name: 'snippet-revisions', params: {snippet_id: snippet.id}}">
								{{ snippet.revisions_count }} revisions
							</router-link>
						</span>
					</span>
					<span class="ml-2">
						<span class="far fa-eye" />
						<span>{{snippet.views}}</span>
					</span>
					<span class="ml-2">
						<span class="far fa-clock" />
						<span itemprop="dateCreated">{{moment(snippet.createdAt).fromNow()}}</span>
					</span>
					<span class="ml-2">
						<span class="far fa-edit" />
						<span itemprop="dateModified">{{moment(snippet.updatedAt).fromNow()}}</span>
					</span>
				</div>
				<pre><code itemprop="text" :class="hljsLanguageById(snippet.language.id)" :style="{'tab-size': preferences.indentationSize}">{{ computedCode }}</code></pre>
				<div class="card" v-if="snippet.description" id="description">
					<div class="card-body">
						<div class="card-text" v-html="marked(snippet.description)" itemprop="description" />
					</div>
				</div>
			</div>
		</div>

		<modal :show="flagModalShown" title="Why are you flagging this snippet?" @on-dismiss="onFlagDismiss">
			<textarea class="form-control" id="flag-description" ref="flagDescription" placeholder="Explain briefly." />
			<button class="btn btn-primary" slot="footer" @click="submitFlag">Send</button>
		</modal>

		<modal :show="deleteModalShown" title="Are you sure you want to delete this snippet?" @on-dismiss="onDeleteDismiss">
			<p>This is irreversible.</p>
			<button class="btn btn-primary" slot="footer" @click="confirmDeletion">Delete it</button>
			<button class="btn btn-primary" slot="footer" @click="onDeleteDismiss">Cancel</button>
		</modal>
	</div>
</template>

<script type="text/javascript">
	import striptags from 'striptags';
	import {mapGetters, mapState} from 'vuex';
	import {apiUrl, getAbsoluteUrl, extractError, hljsLanguageById, highlightCode} from '../../helpers';
	import Modal from '../bootstrap/Modal';
	import {UPDATE_SNIPPET_CURRENT_VOTE} from '../../store/mutation-types';

	export default {
		data: function() {
			return {
				flagModalShown: false,
				deleteModalShown: false,
			};
		},

		methods: {
			showCopiedToast() {
				this.$store.dispatch('toasts/addToast', {
					content: 'Copied!',
					duration: 1500
				});
			},

			vote: function(vote) {
				if (!this.isAuthenticated)
					return this.$router.push({name: 'signin'});

				if (vote === this.snippet.currentVote)
					vote = 0;

				axios.post(apiUrl('/snippets/' + this.$route.params.id + '/vote'), {vote})
					.then(response => {
						this.$store.commit(`snippets/${UPDATE_SNIPPET_CURRENT_VOTE}`, {
							id: this.snippet.id,
							vote 
						});
					}).catch(error => {
						this.$store.dispatch('toasts/addToast', {
							content: extractError(error),
							duration: 4000
						});
				});
			},

			flag: function() {
				if (!this.isAuthenticated)
					return this.$router.push({name: 'signin'});

				this.flagModalShown = true;
				setTimeout(() => { // I have no idea what else could I have done to focus it before it has rendered
					this.$refs.flagDescription.focus();
				}, 16);
			},

			onFlagDismiss: function() {
				this.flagModalShown = false;
			},

			onDeleteDismiss: function() {
				this.deleteModalShown = false;
			},

			deleteSnippet: function() {
				this.deleteModalShown = true;
			},

			confirmDeletion: function() {
				axios.delete(apiUrl(`/snippets/${this.$route.params.id}`))
					.then(() => {
						this.$store.dispatch('toasts/addToast', {
							content: 'Deleted!',
							duration: 4000
						});
						this.$router.push({name: 'discover'});
					}).catch(e => {
						this.$store.dispatch('toasts/addToast', {
							content: extractError(e),
							duration: 4000
						});	
				});
			},

			submitFlag: function() {
				const description = this.$refs.flagDescription.value;
				this.flagModalShown = false;
				this.$store.dispatch('toasts/addToast', {
					content: 'Sending..',
					duration: 30000
				});

				axios.post(apiUrl('/snippets/' + this.$route.params.id + '/flag'), {
					description,
				}).then(response => {
					this.$store.dispatch('toasts/addToast', {
						content: 'Sent!',
						duration: 2000
					});
				}).catch(error => {
					this.$store.dispatch('toasts/addToast', {
						content: extractError(error),
						duration: 3000
					});
				});
			},

			marked,
			moment: moment.utc,
			hljsLanguageById,
		},

		computed: {
			...mapGetters({
				isAuthenticated: 'auth/isAuthenticated',
				preferences: 'auth/preferences',
				snippetById: 'snippets/getById',
			}),
			
			...mapState({
				currentUsername: state => state.users.self.username,
			}),

			snippet: function() {
				return this.snippetById(this.$route.params.id);
			},

			computedCode: function() {
				if (this.preferences.convertTabsToSpaces)
					return this.snippet.code.replace(/\t/g, Array(this.preferences.indentationSize + 1).join(' '));
				return this.snippet.code;
			},
		},

		asyncData: function(store, route) {
			return store.dispatch('snippets/fetch', route.params.id);
		},
		
		mounted: function() {
			highlightCode();
		},

		meta: function() {
			const description = striptags(marked(this.snippet
				? (this.snippet.description ? this.snippet.description : 'No description provided')
			: 'Description loading..'), '<pre>');
			return {
				title: this.snippet
					? this.snippet.language.name + ' - ' + this.snippet.title
					: 'View snippet',
				meta: [
					{name: 'description', content: description ? description : 'No description provided.'},
					{property: 'og:description', content: description ? description : 'No description provided.'},
					{property: 'og:title', content: this.snippet
						? this.snippet.language.name + ' - ' + this.snippet.title
						: 'View snippet'},
					{property: 'og:url', content: getAbsoluteUrl(this.$route.path)},
				]
			};
		},

		components: {
			'modal': Modal,
		},
	};
</script>

<style type="text/css" scoped>
	#data-container {
		min-width: 0;
	}

	.voted {
		color: #e91e63;
	}

	code {
		padding: 1.25rem;
	}

	#flag-description {
		min-height: 10vh;
		width: 100%;
	}

	#flag-btn {
		color: #BC2C1A;
		font-size: 16px;
		vertical-align: super;
	}

	#description >>> img {
		max-width: 100%;
	}

	#stats-bar {
		margin-bottom: 12px;
	}

	#stats-bar .fas,
	#stats-bar .far,
	#stats-bar .fal,
	#stats-bar .fab {
		margin-right: 2px;
	}

	#action-bar {
		margin-top: 32px;
	}

	#action-bar button {
		margin-bottom: 4px;
		border-radius: 1px;
		min-width: 90px;
		width: 100%;
		display: block;
	}

	#voting-buttons {
		text-align: center;
	}

	#voting-buttons > span {
		display: block;
		font-size: 2.5rem;
	}
</style>
