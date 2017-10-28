<template>
	<div class="container">
		<div class="row" v-if="snippet.data" itemscope itemtype="http://schema.org/SoftwareSourceCode">
			<div class="col-xs-12 col-auto">
				<h1>
					<span :class="'fa fa-chevron-up clickable'
							+ ((snippet.data.current_vote && snippet.data.current_vote == 1) ?
								' voted' : '')" @click="vote(1)"></span> <br/>
					<span class="ml-2" itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
						<span itemprop="ratingValue">{{votes}}</span>
					</span> <br/>
					<span :class="'fa fa-chevron-down clickable'
							+ ((snippet.data.current_vote && snippet.data.current_vote == -1) ?
								' voted' : '')" @click="vote(-1)"></span>
				</h1>
			</div>
			<div class="col-xs-12 col" id="data-container">
				<h2 itemprop="about">
					{{snippet.data.title}}
					<a @click.prevent="flag" href="javascript:undefined" id="flag-btn"><span class="fa fa-flag"></span></a>
				</h2>
				<p>
					<span>
						<span class="fa fa-bullseye"></span>
						<span itemprop="codeSampleType">{{snippet.data.category.name}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-code"></span>
						<span itemprop="programmingLanguage">{{snippet.data.language.name}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-user-o"></span>
						<router-link :to="{name: 'view-user', params: {username: snippet.data.username}}" itemprop="author">
							{{snippet.data.username}}
						</router-link>
					</span>
					<span class="ml-2">
						<span class="fa fa-eye"></span>
						<span>{{snippet.data.views}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-code-fork"></span>
						<span itemprop="version">{{snippet.data.updates}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-clock-o"></span>
						<span itemprop="dateCreated">{{moment(snippet.data.created_at).fromNow()}}</span>
					</span>
					<span class="ml-2">
						<span class="fa fa-edit"></span>
						<span itemprop="dateModified">{{moment(snippet.data.updated_at).fromNow()}}</span>
					</span>
				</p>
				<pre><code itemprop="text" :class="codeLanguage" :style="{'tab-size': preferences.indentation_size}">{{ computedCode }}</code></pre>
				<div class="card" v-if="snippet.data.description">
					<div class="card-body">
						<div class="card-text" v-html="marked(snippet.data.description)" itemprop="description">
						</div>
					</div>
				</div>
			</div>
		</div>
		<modal :show="flagModalShown" title="Why are you flagging this snippet?" :onDismiss="onFlagDismiss">
			<textarea class="form-control" id="flag-description" ref="flagDescription" placeholder="Explain briefly."></textarea>
			<button class="btn btn-primary" slot="footer" @click="submitFlag">Send</button>
		</modal>
	</div>
</template>

<script type="text/javascript">
	import {mapGetters} from 'vuex';
	import {apiUrl, getAbsoluteUrl, cookToast, extractError} from '../../helpers';
	import Modal from '../bootstrap/Modal';

	export default {
		data: () => ({
			snippet: {},
			originalCurrentVote: 0,

			flagModalShown: false,
		}),

		methods: {
			vote: function(vote) {
				if (!this.isAuthenticated)
					return this.$router.push({name: 'signin'});

				if (vote === this.snippet.data.current_vote)
					vote = 0;

				axios.post(apiUrl('/snippets/' + this.$route.params.id + '/vote'), {vote})
					.then(response => {
						this.snippet.data.current_vote = vote;
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
				})
			},

			marked,
			moment: moment.utc,
		},

		computed: {
			...mapGetters([
				'isAuthenticated',
				'preferences',
			]),

			votes: function() {
				if (typeof(this.snippet.data.current_vote) === 'number')
					return this.snippet.data.votes + (this.snippet.data.current_vote - this.originalCurrentVote)
				return this.snippet.data.votes;
			},

			computedCode: function() {
				if (this.preferences.convert_tabs_to_spaces || !('tab-size' in document.body.style))
					return this.snippet.data.code.replace(/\t/g, Array(this.preferences.indentation_size + 1).join(' '));
				return this.snippet.data.code;
			},

			codeLanguage: function() {
				if (!this.snippet.data || !this.snippet.data.language)
					return '';

				switch(this.snippet.data.language.id) {
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

		beforeRouteEnter: function(to, from, next) {
			axios.get(apiUrl('/snippets/' + to.params.id))
				.then(response => {
					next(vm => {
						vm.snippet = response.data;
						vm.originalCurrentVote = response.data.data.current_vote;
					});
				}).catch(error => {
					cookToast('Snippet not found', 2000);
					next(false);
				});
		},

		updated: function() {
			$("pre code:not(.hljs)").each((i, b) => {
				hljs.highlightBlock(b);
			});
			this.$emit('updateHead');
		},

		head: {
			title: function() {
				return {
					inner: this.snippet.data
						? this.snippet.data.language.name + " - " + this.snippet.data.title
						: 'View snippet'
				};
			},

			meta: function() {
				const div = $("<div></div>");
				div.html(marked(this.snippet.data ? this.snippet.data.description : 'No description provided.'));
				div.children('pre').remove();
				const description = div.text();

				return [
					{name: 'description', content: description ? description : "No description provided."},
					{property: 'og:description', content: description ? description : "No description provided."},
	                {property: 'og:title', content: this.snippet.data
						? this.snippet.data.language.name + " - " + this.snippet.data.title
						: 'View snippet'},
	                {property: 'og:url', content: getAbsoluteUrl(this.$route.path)},
				];
			},
		},

		components: {
			'modal': Modal,
		},
	}
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
</style>
