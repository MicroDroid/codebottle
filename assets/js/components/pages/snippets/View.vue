<template>
	<div class="container">
		<div class="row snippet-details">
			<div class="col-auto">
				<div class="text-center voting-buttons">
					<span :class="{voted: snippet.currentVote && snippet.currentVote == 1}"
						class="fas fa-chevron-up clickable" @click="vote(1)"/>
					<span itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
						<span itemprop="ratingValue">{{ snippet.votes }}</span>
					</span>
					<span :class="{voted: snippet.currentVote && snippet.currentVote == -1}"
						class="fas fa-chevron-down clickable" @click="vote(-1)"/>
				</div>
			</div>

			<div class="col">
				<h2 itemprop="about">
					{{ snippet.title }}
					<a href="javascript:undefined" class="flag-btn" @click.prevent="flag">
						<span class="fas fa-flag" />
					</a>
				</h2>
				<div class="text-muted mb-2">
					<span>
						<span class="far fa-bullseye mr-1" />
						<span itemprop="codeSampleType">{{ snippet.category.name }}</span>
					</span>
					<span class="ml-2">
						<span class="far fa-code mr-1" />
						<span itemprop="programmingLanguage">{{ snippet.language.name }}</span>
					</span>
					<span class="ml-2">
						<span class="far fa-user mr-1" />
						<router-link :to="{name: 'view-user', params: {username: snippet.username}}" itemprop="author">
							{{ snippet.username }}
						</router-link>
					</span>
					<span class="ml-2">
						<span class="far fa-sync mr-1" />
						<span>
							<router-link :to="{name: 'snippet-revisions', params: {snippet_id: snippet.id}}">
								{{ snippet.revisions_count }} revisions
							</router-link>
						</span>
					</span>
					<span class="ml-2">
						<span class="far fa-eye mr-1" />
						<span>{{ snippet.views }}</span>
					</span>
					<span class="ml-2">
						<span class="far fa-clock mr-1" />
						<span itemprop="dateCreated">{{ moment(snippet.createdAt).fromNow() }}</span>
					</span>
					<span class="ml-2">
						<span class="far fa-edit mr-1" />
						<span itemprop="dateModified">{{ moment(snippet.updatedAt).fromNow() }}</span>
					</span>
				</div>


				<div class="action-bar mt-3">
					<button v-clipboard="computedCode" class="btn btn-info btn-sm" @click="showCopiedToast">
						<span class="far fa-copy" /> Copy
					</button>
					<router-link v-if="self.admin || snippet.username === self.username"
						:to="{name: 'edit-snippet', params: {id: snippet.id}}"
						tag="button" class="btn btn-warning btn-sm"
					>
						<span class="far fa-pencil" /> Edit
					</router-link>
					<button v-if="self.admin || snippet.username === self.username" class="btn btn-danger btn-sm"
						@click="deleteSnippet">
						<span class="far fa-trash" /> Delete
					</button>
				</div>
			</div>
		</div>

		<div class="tags mt-2">
			<template v-if="!editingTags">
				<template v-if="snippet.tags.length > 0">
					<span v-for="tag in snippet.tags"
						:key="tag.id"
						class="tag"
					>
						{{ tag.name }}
					</span>
				</template>

				<a v-if="currentUsername === snippet.username"
					href="javascript:undefined"
					:class="{ 'ml-1': snippet.tags.length > 0 }"
					class="text-muted text-sm"
					@click="editTags"
				>
					{{ snippet.tags.length > 0 ? 'edit tags' : 'add tags' }}
				</a>
			</template>

			<div class="row" v-if="editingTags">
				<div class="col">
					<tags-input v-model="tags"
						element-id="tags"
						:existing-tags="availableTags"
						:typeahead="true"
						:typeahead-max-results="10"
						:typeahead-activation-threshold="0"
						input-class="form-control"
						only-existing-tags
					/>
				</div>

				<div class="col-auto">
					<button class="btn btn-primary" @click="saveTags">
						Save
					</button>
				</div>
			</div>
		</div>

		<pre><code :style="{'tab-size': preferences.indentationSize}"
			:class="hljsLanguageById(snippet.language.id)"
			itemprop="text"
			class="p-3 mt-3">{{ computedCode }}</code></pre>

		<div v-if="snippet.description" class="card description">
			<div class="card-body">
				<div class="card-text" itemprop="description" v-html="marked(snippet.description, {sanitize: true})" />
			</div>
		</div>

		<modal :show="flagModalShown" title="Why are you flagging this snippet?"
			@on-dismiss="onFlagDismiss">
			<textarea ref="flagDescription" class="form-control flag-description w-100" placeholder="Explain briefly." />
			<button slot="footer" class="btn btn-primary" @click="submitFlag">
				Send
			</button>
		</modal>

		<modal :show="deleteModalShown" title="Are you sure you want to delete this snippet?"
			@on-dismiss="onDeleteDismiss">
			<p>This is irreversible.</p>
			<button slot="footer" class="btn btn-primary" @click="confirmDeletion">
				Delete it
			</button>
			<button slot="footer" class="btn btn-primary" @click="onDeleteDismiss">
				Cancel
			</button>
		</modal>
	</div>
</template>

<script type="text/javascript">
	import striptags from 'striptags';
	import { mapGetters, mapState } from 'vuex';
	import TagsInput from '@voerro/vue-tagsinput';

	import { apiUrl, getAbsoluteUrl, extractError, hljsLanguageById, highlightCode } from '../../../helpers';
	import Modal from '../../bootstrap/Modal';
	import { UPDATE_SNIPPET_CURRENT_VOTE } from '../../../store/mutation-types';

	export default {
		components: {
			Modal,
			TagsInput,
		},

		data() {
			return {
				flagModalShown: false,
				deleteModalShown: false,
				tags: [],

				editingTags: false,
				savingTags: false,
			};
		},

		computed: {
			...mapGetters({
				isAuthenticated: 'auth/isAuthenticated',
				preferences: 'auth/preferences',
				snippetById: 'snippets/getById',
			}),

			...mapState('tags', {
				availableTags: state => state.tags.reduce((object, tag) => ({...object, [tag.id]: tag.name}), {}),
			}),

			...mapState({
				self: state => state.users.self,
			}),

			snippet() {
				return this.snippetById(this.$route.params.id);
			},

			computedCode() {
				if (this.preferences.convertTabsToSpaces)
					return this.snippet.code.replace(/\t/g, Array(this.preferences.indentationSize + 1).join(' '));
				return this.snippet.code;
			},
		},

		mounted() {
			highlightCode();
		},

		methods: {
			showCopiedToast() {
				this.$store.dispatch('toasts/addToast', {
					content: 'Copied!',
					duration: 1500,
				});
			},

			vote(vote) {
				if (!this.isAuthenticated)
					return this.$router.push({ name: 'signin' });

				if (vote === this.snippet.currentVote)
					vote = 0;

				axios.post(apiUrl('/snippets/' + this.$route.params.id + '/vote'), { vote })
					.then(() => {
						this.$store.commit(`snippets/${UPDATE_SNIPPET_CURRENT_VOTE}`, {
							id: this.snippet.id,
							vote,
						});
					}).catch(error => {
						this.$store.dispatch('toasts/addToast', {
							content: extractError(error),
							duration: 4000,
						});
					});
			},

			flag: function() {
				if (!this.isAuthenticated)
					return this.$router.push({ name: 'signin' });

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
							duration: 4000,
						});
						this.$router.push({ name: 'discover' });
					}).catch(e => {
						this.$store.dispatch('toasts/addToast', {
							content: extractError(e),
							duration: 4000,
						});
					});
			},

			submitFlag: function() {
				const description = this.$refs.flagDescription.value;
				this.flagModalShown = false;
				this.$store.dispatch('toasts/addToast', {
					content: 'Sending..',
					duration: 30000,
				});

				axios.post(apiUrl('/snippets/' + this.$route.params.id + '/flag'), {
					description,
				}).then(() => {
					this.$store.dispatch('toasts/addToast', {
						content: 'Sent!',
						duration: 2000,
					});
				}).catch(error => {
					this.$store.dispatch('toasts/addToast', {
						content: extractError(error),
						duration: 3000,
					});
				});
			},

			editTags() {
				// honestly no idea
				this.tags = this.snippet.tags.map(t => t.id).join(',');
				this.editingTags = true;
			},

			saveTags() {
				this.savingTags = true;

				axios.put(apiUrl(`/snippets/${this.$route.params.id}/tags`), {
					tags: Object.values(this.tags),
				}).then(() => {
					return this.$store.dispatch('snippets/fetch', this.$route.params.id);
				}).then(() => {
					this.editingTags = false;
				}).catch(error => {
					this.$store.dispatch('toasts/addToast', {
						content: extractError(error),
						duration: 3000,
					});
				}).finally(() => {
					this.savingTags = false;
				});
			},

			marked,
			moment: moment.utc,
			hljsLanguageById,
		},

		asyncData: function(store, route) {
			return Promise.all([
				store.dispatch('snippets/fetch', route.params.id),
				store.dispatch('tags/fetchAll'),
			]).catch(error => {
				if (error.response && error.response.status === 404)
					throw { status: 404 };
				else
					throw error;
			});
		},

		meta: function() {
			const description = striptags(marked(this.snippet
				? (this.snippet.description ? this.snippet.description : 'No description provided')
				: 'Description loading..', { sanitize: true }), '<pre>');
			return {
				title: this.snippet
					? this.snippet.language.name + ' - ' + this.snippet.title
					: 'View snippet',
				meta: [
					{ name: 'description', content: description ? description : 'No description provided.' },
					{ property: 'og:description', content: description ? description : 'No description provided.' },
					{ property: 'og:title', content: this.snippet
						? this.snippet.language.name + ' - ' + this.snippet.title
						: 'View snippet' },
					{ property: 'og:url', content: getAbsoluteUrl(this.$route.path) },
				],
			};
		},
	};
</script>

<style lang="scss" scoped>
	.voted {
		color: #e91e63;
	}

	.flag-description {
		min-height: 10vh;
	}

	.flag-btn {
		color: #BC2C1A;
		font-size: 1rem;
		vertical-align: super;
	}

	.description /deep/ img {
		max-width: 100%;
	}

	.action-bar button {
		margin-right: 0.5rem;
		border-radius: 1px;
		min-width: 90px;
		display: inline-block;
	}

	.voting-buttons > span {
		display: block;
		font-size: 2.5rem;
		line-height: 1;
	}

	.tags {
		.tag {
			color: $white;
			border: 1px dotted rgba($white, 0.7);
			border-radius: 0.25rem;
			font-size: 0.75rem;
			padding: 0.125rem 0.25rem;
			display: inline-block;
			margin-right: 0.5rem;
		}
	}
</style>
