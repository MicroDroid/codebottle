<template>
	<div class="container">
		<h1 class="mb-3">Embedding</h1>
		<h3>Search badge</h3>
		<p>Currently we only have search badges, feel free to play wildly with them and use them anywhere. Maybe it'd look nice if you embed a badge to indicate how many snippets are there relevant to a library or something.</p>
		<form class="form-inline mb-3" @submit.prevent="makeSearchBadge">
			<input v-model="searchBadgeKeywords" class="form-control" placeholder="Keywords">
			<div class="btn-group ml-2" role="group">
				<dropdown :options="languageOptions" :selective="true" label="Language" key-field="id"
					label-field="name" @on-select="onLanguage"/>
				<dropdown :options="formatOptions" :selective="true" label="Format" key-field="id"
					label-field="name" @on-select="onFormat" />
				<button type="submit" class="btn btn-primary">Generate</button>
			</div>
		</form>
		<img v-if="searchBadgeImg !== ''" :src="searchBadgeImg" class="mb-2">
		<br>
		<code v-if="searchBadgeResult">{{ searchBadgeResult }}</code>
	</div>
</template>

<script type="text/javascript">
	import {mapState} from 'vuex';
	import Dropdown from '../bootstrap/Dropdown';
	import {getAbsoluteUrl, cookGetParameters} from '../../helpers';

	export default {
		components: {
			'dropdown': Dropdown,
		},

		data: function() {
			return {
				searchBadgeKeywords: '',
				searchBadgeLanguage: -1,
				searchBadgeImg: '',
				searchBadgeResult: '',
				formatOptions: [
					{id: 1, name: 'Markdown',  format: (img, url) => `[![Snippets Stats](${img})](${url})`},
					{id: 2, name: 'Textile',   format: (img, url) => `!${img}!:${url}`},
					{id: 3, name: 'Rdoc',      format: (img, url) => `{<img src="${img}" alt="Snippet Stats" />}[${url}]`},
					{id: 4, name: 'AsciiDoc',  format: (img, url) => `image:${img}["Snippet Stats", link="${url}"]`},
					{id: 6, name: 'Pod',       format: (img, url) => `=for html <a href="${url}"><img src="${img}"></a>`},
					{id: 8, name: 'Image URL', format: img => img},
				],
				searchBadgeFormat: false,
			};
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

		methods: {
			onLanguage: function(language) {
				this.searchBadgeLanguage = language.id;
			},

			onFormat: function(format) {
				this.searchBadgeFormat = format;
			},

			makeSearchBadge: function() {
				var params = {keywords: this.searchBadgeKeywords};

				if (this.searchBadgeLanguage !== -1)
					params.language = this.searchBadgeLanguage;

				this.searchBadgeImg = getAbsoluteUrl('/embed/search-badge?' + cookGetParameters(params));
				if (this.searchBadgeFormat)
					this.searchBadgeResult = this.searchBadgeFormat.format(this.searchBadgeImg, getAbsoluteUrl('/?' + cookGetParameters({q: this.searchBadgeKeywords})));
				else this.searchBadgeResult = 'Invalid format';
			}
		},

		meta: {
			title: 'Embedding',

			meta: [
				{name: 'description', content: 'Create elegant CodeBottle embeds that integrate seamlessly with your content in seconds.'},
				{property: 'og:title', content: 'Create CodeBottle embeds'},
				{property: 'og:description', content: 'Create elegant CodeBottle embeds that integrate seamlessly with your content in seconds.'},
			],
		},
	};
</script>
