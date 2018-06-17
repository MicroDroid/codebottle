<template>
	<div class="container">
		<div class="row">
			<div>
				<div class="col-xs-12 col-sm-10 col-md-9 col-lg-7" id="form-wrapper">
					<form @submit.prevent="search" id="search-form">
						<input type="text" v-model="keywords" 
							id="searchbox" placeholder="Search snippets" ref="searchbox"
							class="form-control stretched">

						<div class="btn-group" role="group" id="btns">
							<dropdown label="Language" :options="languageOptions"
								@on-select="onLanguage"
								:selective="true"
								key-field="id"
								label-field="name"></dropdown>
							<button type="submit" class="btn btn-primary">Search</button>
						</div>
					</form>
				</div>
				<hr>
				<div id="results-container">
					<div class="alert alert-danger" v-if="error">{{error}}</div>
					<div class="alert alert-warning alert-transparent" v-if="!loading && !error && (!results || results.length < 1)">
						No results
					</div>
					<div :style="{opacity: loading ? 0.7 : 1.0}">
						<div v-for="result in results">
							<router-link :to="{name: 'view-snippet', params: {id: result.id}}">
								{{result.title}}
							</router-link>
							<p>
								{{shorten(summarize(result.description), 350)}}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {shorten, extractError, cookGetParameters, apiUrl, staticUrl} from '../../helpers';
	import {mapState} from 'vuex';
	import Dropdown from '../bootstrap/Dropdown';
	import summarize from 'summarize-markdown';
	import debounce from 'lodash.debounce';

	export default {
		data: function () {
			return {
				loading: false,
				error: false,
				keywords: '',
				language: -1,
				results: {},
				axiosSource: null,
				searchDebounce: null,
			};
		},

		watch: {
			'$route': function(to, from) {
				if (this.$route.query.q) {
					this.keywords = this.$route.query.q;
					this.search();
					this.$refs.searchbox.focus();					
				}
			},

			keywords: function() {
				if (this.searchDebounce)
					this.searchDebounce.cancel();

				this.searchDebounce = debounce(this.search, 250);
				this.searchDebounce();
			}
		},

		methods: {
			onLanguage: function(language) {
				this.language = language.id;
			},

			search: function() {
				this.$router.replace({name: 'search', query: {q: this.keywords}});
				this.error = false;
				this.loading = true;

				var params = {keywords: this.keywords};

				if (this.language !== -1)
					params.language = this.language;

				if (this.axiosSource)
					this.axiosSource.cancel();

				const CancelToken = axios.CancelToken;
				this.axiosSource = CancelToken.source();

				axios.get(apiUrl('/snippets?' + cookGetParameters(params)), {
					cancelToken: this.axiosSource.token,
				})
				.then(response => {
					this.loading = false;
					this.results = response.data;
				})
				.catch(error => {
					if (axios.isCancel(error)) {
						// Do nothing, I guess.
					} else {
						this.results = [];
						this.loading = false;
						this.error = extractError(error);
					}
				});
			},

			shorten, staticUrl, summarize
		},

		computed: {
			...mapState([
				'languages',
			]),

			languageOptions: function() {
				return [
					{id: -1, name: 'All languages'},
					...this.languages,
				];
			},
		},

		mounted: function() {
			this.keywords = this.$route.query.q ? this.$route.query.q : '';
			this.$refs.searchbox.focus();
		},

		meta: function() {
			return {
				title: `'${this.keywords || this.$route.query.q}'`,
				meta: [
					{name: 'description', content: 'Search modular code + code examples made by developers from around the world'},
					{property: 'og:title', content: 'CodeBottle'},
					{property: 'og:description', content: 'Search modular code + code examples made by developers from around the world'},
				],
			}
		},

		components: {
			'dropdown': Dropdown,
		},
	};
</script>

<style type="text/css" scoped>
	#logo {
		position: absolute;
	}

	#logo-wrapper {
		margin-top: 3vh;
		padding-bottom: 46.22%;
		position: relative;
	}

	#search-form {
		display: flex;
		margin-bottom: 16px;
	}

	#search-form #btns {
		margin-left: 8px;
	}

	#search-form #searchbox {
		flex: 2;
	}

	#results-container {
		margin-top: 24px;
	}

	#form-wrapper {
		padding-left: 0;
	}

	#results-container .alert {
		background: none;
		border: none;
		padding: 8px;
	}

	.stretched {
		width: 100%;
	}

	.result {
		margin-bottom: 32px;
	}

	.container > .row > div {
		width: 100%;
	}
</style>
