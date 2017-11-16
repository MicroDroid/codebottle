<template>
	<div class="container">
		<div class="row">
			<div>
				<div :class="{
					'col-xs-12': true,
					'col-sm-10': true,
					'col-md-9': searching,
					'col-lg-7': searching,
					'col-md-8': !searching,
					'col-lg-6': !searching,
					'ml-auto': !searching,
					'mr-auto': !searching,
				}" id="form-wrapper">
					<div id="logo-wrapper" v-if="!searching">
						<img :src="staticUrl('/images/bottle.png')" id="logo" class="img-fluid">
					</div>

					<form @submit.prevent="search" :id="searching ? 'searching-form' : 'not-searching-form'">
						<input type="text" v-model="keywords" 
							id="searchbox" placeholder="Search code" ref="searchbox" autofocus
							:class="{
								'form-control': true,
								'stretched': searching,
								'center-text': !searching,
							}">

						<div class="btn-group" role="group" id="btns">
							<dropdown label="Language" :options="languageOptions"
								:onSelect="onLanguage"
								:selective="true"
								labelField="name"></dropdown>
							<button type="submit" class="btn btn-primary">Search</button>
						</div>
					</form>
				</div>
				<hr v-if="searching">
				<div v-if="searching" id="results-container">
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

	export default {
		data: function () {
			return {
				loading: false,
				error: false,
				searching: false,
				keywords: '',
				language: -1,
				results: {},
				axiosSource: null,
				searchDebounce: null,
			}
		},

		watch: {
			'$route': function(to, from) {
				if (this.$route.query.q) {
					this.keywords = this.$route.query.q;
					this.search();
				}
			},

			keywords: function() {
				this.searching = true;

				if (this.searchDebounce)
					this.searchDebounce.cancel();

				this.searchDebounce = _.debounce(this.search, 250);
				this.searchDebounce();
			}
		},

		methods: {
			onLanguage: function(language) {
				this.language = language.id;
			},

			search: function() {
				this.$router.replace({name: 'search', query: {q: this.keywords}});
				this.searching = true;
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

			if (this.keywords)
				this.search();

			this.$refs.searchbox.focus();
		},

		head: {
			meta: [
				{name: 'description', content: 'Quickly drag-and-drop snippets to your application. Entirely free, community-powered. Stop reinventing the wheel and build better software.'},
				{property: 'og:title', content: 'CodeBottle'},
				{property: 'og:description', content: 'Quickly drag-and-drop snippets to your application. Entirely free, community-powered. Stop reinventing the wheel and build better software.'},
			],
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

	#not-searching-form #searchbox {
		margin-top: 16px;
	}

	#not-searching-form #btns {
		margin-top: 18px;
	}

	#not-searching-form {
		text-align: center;
	}

	#searching-form {
		display: flex;
		margin-bottom: 16px;
	}

	#searching-form #btns {
		margin-left: 8px;
	}

	#searching-form #searchbox {
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
