<template>
	<div class="container">
		<div class="row" v-if="snippet" itemscope itemtype="http://schema.org/SoftwareSourceCode">
			<div class="col-xs-12 col-auto">
				<h1>
					<span :class="{
							'fa': true,
							'fa-chevron-up': true,
							'clickable': true,
							'voted': snippet.currentVote && snippet.currentVote == 1
						}" @click="vote(1)"></span> <br/>
					<span class="ml-2" itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
						<span itemprop="ratingValue">{{votes}}</span>
					</span> <br/>
					<span :class="'fa fa-chevron-down clickable'
							+ ((snippet.currentVote && snippet.currentVote == -1) ?
								' voted' : '')" @click="vote(-1)"></span>
				</h1>
			</div>
			<div class="col-xs-12 col" id="data-container">
				<h2 itemprop="about">
					{{snippet.title}}
					<a @click.prevent="flag" href="javascript:undefined" id="flag-btn"><span class="fa fa-flag"></span></a>
				</h2>
				<p id="stats-bar">
					<span>
						<span class="fa fa-bullseye"></span>
						<span itemprop="codeSampleType">{{snippet.category.name}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-code"></span>
						<span itemprop="programmingLanguage">{{snippet.language.name}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-user-o"></span>
						<router-link :to="{name: 'view-user', params: {username: snippet.username}}" itemprop="author">
							{{snippet.username}}
						</router-link>
					</span>
					<span class="ml-2">
						<span class="fa fa-eye"></span>
						<span>{{snippet.views}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-code-fork"></span>
						<span itemprop="version">{{snippet.updates}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-clock-o"></span>
						<span itemprop="dateCreated">{{moment(snippet.createdAt).fromNow()}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-edit"></span>
						<span itemprop="dateModified">{{moment(snippet.updatedAt).fromNow()}}</span>
					</span>
				</p>
				<p id="action-bar">
					<button class="btn btn-info btn-sm" v-clipboard="computedCode" @click="() => cookToast('Copied!', 1500)">
						<span class="fa fa-copy"></span> Copy
					</button>
					<button class="btn btn-danger btn-sm" @click="deleteSnippet">
						<span class="fa fa-trash"></span> Delete
					</button>
				</p>
				<pre><code itemprop="text" :class="codeLanguage" :style="{'tab-size': preferences.indentationSize}">{{ computedCode }}</code></pre>
				<div class="card" v-if="snippet.description" id="description">
					<div class="card-body">
						<div class="card-text" v-html="marked(snippet.description)" itemprop="description">
						</div>
					</div>
				</div>
			</div>
		</div>

		<modal :show="flagModalShown" title="Why are you flagging this snippet?" :onDismiss="onFlagDismiss">
			<textarea class="form-control" id="flag-description" ref="flagDescription" placeholder="Explain briefly."></textarea>
			<button class="btn btn-primary" slot="footer" @click="submitFlag">Send</button>
		</modal>

		<modal :show="deleteModalShown" title="Are you sure you want to delete this snippet?" :onDismiss="onDeleteDismiss">
			<p>This is irreversible.</p>
			<button class="btn btn-primary" slot="footer" @click="confirmDeletion">Delete it</button>
			<button class="btn btn-primary" slot="footer" @click="onDeleteDismiss">Cancel</button>
		</modal>
	</div>
</template>

<script type="text/javascript">
	import striptags from 'striptags';
	import {mapGetters} from 'vuex';
	import {apiUrl, getAbsoluteUrl, cookToast, extractError} from '../../helpers';
	import Modal from '../bootstrap/Modal';

	export default {
		data: function() {
			return {
				flagModalShown: false,
				deleteModalShown: false,
				originalCurrentVote: false,
			};
		},

		methods: {
			vote: function(vote) {
				if (!this.isAuthenticated)
					return this.$router.push({name: 'signin'});

				if (vote === this.snippet.currentVote)
					vote = 0;

				axios.post(apiUrl('/snippets/' + this.$route.params.id + '/vote'), {vote})
					.then(response => {
						this.snippet.currentVote = vote;
					}).catch(error => {
						// pls
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
						cookToast('Deleted!', 4000);
						this.$router.push({name: 'discover'});
					}).catch(e => {
						cookToast(extractError(e), 4000);	
					});
			},

			submitFlag: function() {
				const description = this.$refs.flagDescription.value;
				this.flagModalShown = false;
				cookToast('Sending..', 30000);

				axios.post(apiUrl('/snippets/' + this.$route.params.id + '/flag'), {
					description,
				}).then(response => {
					cookToast('Sent!', 2000);
				}).catch(error => {
					cookToast(extractError(error), 3000);
				});
			},

			marked, cookToast,
			moment: moment.utc,
		},

		computed: {
			...mapGetters({
				isAuthenticated: 'auth/isAuthenticated',
				preferences: 'auth/preferences',
				snippetById: 'snippets/getById',
			}),

			snippet: function() {
				return this.snippetById(this.$route.params.id);
			},

			votes: function() {
				if (typeof(this.snippet.currentVote) === 'number')
					return this.snippet.votes + (this.snippet.currentVote - this.originalCurrentVote);
				return this.snippet.votes;
			},

			computedCode: function() {
				if (this.preferences.convertTabsToSpaces)
					return this.snippet.code.replace(/\t/g, Array(this.preferences.indentationSize + 1).join(' '));
				return this.snippet.code;
			},

			codeLanguage: function() {
				if (!this.snippet || !this.snippet.language)
					return '';

				switch(this.snippet.language.id) {
					case 1:  return 'java';
					case 2:  return 'cpp';
					case 3:  return 'cs';
					case 4:  return 'python';
					case 5:  return 'php';
					case 6:  return 'javascript';
					case 7:  return 'perl';
					case 8:  return 'ruby';
					case 9:  return 'powershell';
					case 10: return 'lua';
					default: return '';
				}
			}
		},

		asyncData: function(store, route) {
			return store.dispatch('snippets/fetch', route.params.id);
		},

		updated: function() {
			document.querySelectorAll('pre code:not(.hljs)').forEach(b => {
				hljs.highlightBlock(b);
			});
		},

		mounted: function() {
			this.originalCurrentVote = this.snippet.currentVote;
		},

		meta: function() {
			const description = striptags(marked(this.snippet ? this.snippet.description : 'No description provided.'), '<pre>');
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

	#action-bar button .fa {
		margin-right: 3px;
	}

	#action-bar button {
		margin-right: 4px;
	}
</style>
