<template>
	<div class="container">
		<div class="row">
			<div v-if="!searching">
				<div class="col-xs-12
							col-sm-10
							col-md-8
							col-lg-6 ml-auto mr-auto">
					<div id="logo-wrapper">
						<img :src="staticUrl('/images/bottle.png')" id="logo" class="img-fluid">
					</div>

					<form id="not-searching-form" @submit.prevent="search">
						<input type="text" v-model="keywords" class="form-control center-text" id="searchbox" placeholder="Search code" ref="searchbox" autofocus>

						<div class="btn-group" role="group" id="btns">
							<dropdown label="Language" :options="languageOptions"
								:onSelect="onLanguage"
								:selective="true"
								labelField="name"></dropdown>
							<button type="submit" class="btn btn-primary">Search</button>
						</div>
					</form>
				</div>
			</div>

			<div v-if="searching" class="stretched">
				<div class="col-xs-12 col-sm-10 col-md-9 col-lg-7">
					<form id="searching-form" @submit.prevent="search">
						<input type="text" v-model="keywords"
							class="form-control stretched"
							id="searchbox"
							placeholder="Search code" autofocus>

						<div class="btn-group" role="group" id="btns">
							<dropdown label="Language" :options="languageOptions"
								:onSelect="onLanguage"
								:selective="true"
								labelField="name"></dropdown>
							<button type="submit" class="btn btn-primary">Search</button>
						</div>
					</form>
				</div>
				<hr>
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
</template>

<script type="text/javascript">
	import {shorten, extractError, findGetParameter, cookGetParameters, updateUrlParameter, apiUrl, staticUrl} from '../../helpers';
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
			}
		},

		watch: {
			'$route': function(to, from) {
				if (this.$route.query.q) {
					this.keywords = this.$route.query.q;
					this.search();
				}
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

				axios.get(apiUrl('/snippets?' + cookGetParameters(params)))
					.then(response => {
						this.loading = false;
						this.results = response.data;
					})
					.catch(error => {
						this.results = [];
						this.loading = false;
						this.error = extractError(error);
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
	}
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
	}

	#searching-form #btns {
		margin-left: 8px;
	}

	#searching-form #searchbox {
		flex: 2;
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
