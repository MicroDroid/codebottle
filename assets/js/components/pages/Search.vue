<template>
	<div class="container">
		<div class="row">
			<div class="col-12 col-sm-10 col-md-9 col-lg-7">
				<form class="mb-2" @submit.prevent="search">
					<div class="row no-gutters">
						<div class="col">
							<input ref="searchbox" v-model="keywords" type="text" placeholder="Search snippets"
								class="form-control w-100">
						</div>
						<div class="col-auto">
							<div class="btn-group ml-2" role="group">
								<dropdown :options="languageOptions" :selective="true" label="Language" key-field="id"
									label-field="name" @on-select="onLanguage" />
								<button type="submit" class="btn btn-primary">Search</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>

		<hr>

		<div v-if="error" class="alert alert-danger">{{ error }}</div>
		<div v-if="!loading && !error && (!results || results.length < 1)" class="alert alert-warning alert-transparent">
			No results
		</div>
		<div :class="{loading}">
			<div v-for="result in results" :key="result.id">
				<router-link :to="{name: 'view-snippet', params: {id: result.id}}">
					{{ result.title }}
				</router-link>
				<p>
					{{ shorten(summarize(result.description), 350) }}
				</p>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {shorten, extractError, staticUrl} from '../../helpers';
	import {mapState, mapGetters} from 'vuex';
	import Dropdown from '../bootstrap/Dropdown';
	import summarize from 'summarize-markdown';
	import debounce from 'lodash.debounce';

	export default {
		components: {
			'dropdown': Dropdown,
		},

		data() {
			return {
				loading: false,
				error: false,
				keywords: '',
				language: null,
				axiosSource: null,
			};
		},

		computed: {
			...mapState('languages', {
				languages: state => state.languages,
			}),

			...mapGetters('snippets', {
				getResults: 'getSearchResults',
			}),

			results() {
				return this.getResults({
					keywords: this.keywords,
					language: this.language,
				});
			},

			languageOptions() {
				return [
					{id: null, name: 'All languages'},
					...this.languages,
				];
			},
		},

		watch: {
			$route() {
				if (this.$route.query.q) {
					this.keywords = this.$route.query.q;
					this.search();
					this.$refs.searchbox.focus();
				}
			},

			keywords() {
				if (this.$route.query.q !== this.keywords)
					this.$router.replace({name: 'search', query: {q: this.keywords}});
			},

			language() {
				this.search();
			}
		},

		mounted() {
			this.keywords = this.$route.query.q ? this.$route.query.q : '';
			this.$refs.searchbox.focus();
			this.search();
		},

		methods: {
			onLanguage(language) {
				this.language = language.id;
			},

			search: debounce(function() {
				this.error = false;
				this.loading = true;

				if (this.axiosSource)
					this.axiosSource.cancel();

				const CancelToken = axios.CancelToken;
				this.axiosSource = CancelToken.source();

				this.$store.dispatch('snippets/search', {
					keywords: this.keywords,
					language: this.language,
				}).then(() => {
					this.loading = false;
				}).catch(error => {
					if (axios.isCancel(error)) {
						// Do nothing, I guess.
					} else {
						this.loading = false;
						this.error = extractError(error);
					}
				});
			}, 250),

			shorten, staticUrl, summarize
		},

		meta() {
			return {
				title: `'${this.keywords || this.$route.query.q}'`,
				meta: [
					{name: 'description', content: 'Search modular code + code examples made by developers from around the world'},
					{property: 'og:title', content: 'CodeBottle'},
					{property: 'og:description', content: 'Search modular code + code examples made by developers from around the world'},
				],
			};
		},
	};
</script>

<style lang="scss" scoped>
	.alert {
		background: none;
		border: none;
		padding: 8px;
	}

	.loading {
		opacity: 0.7;
	}
</style>
