<template>
	<div class="container">
		<div class="row">
			<div class="col-12 col-md-auto">
				<img :src="staticUrl('/images/bottle.png')" alt="CodeBottle" height="156" title="CodeBottle">
			</div>
			<div class="col-12 col-md mt-4 mt-md-0">
				<h4 class="font-weight-bold">
					Code snippets, by the community
				</h4>

				<p class="text-muted mb-1">
					<span class="fa fa-fw fa-check text-success" />
					Re-use existing code
				</p>
				<p class="text-muted mb-1">
					<span class="fa fa-fw fa-check text-success" />
					Share and learn
				</p>
				<p class="text-muted mb-1">
					<span class="fa fa-fw fa-check text-success" />
					MIT Licensed
				</p>
				<p class="text-muted mb-1">
					<span class="fa fa-fw fa-times text-danger" />
					Deliver past deadline
				</p>
				<p class="text-muted mb-1">
					<span class="fa fa-fw fa-times text-danger" />
					Boggle your mind
				</p>
			</div>
		</div>

		<h3 class="font-weight-bold mt-5">
			New Snippets
		</h3>

		<SnippetsBoard :snippets="snippets._new" class="mt-3" />

		<h3 class="font-weight-bold mt-5">
			Discord things
		</h3>

		<SnippetsBoard :snippets="snippets.discord" class="mt-3" />

		<h3 class="font-weight-bold mt-5">
			Dart is evolving!
		</h3>

		<SnippetsBoard :snippets="snippets.dart" class="mt-3" />
	</div>
</template>

<script type="text/javascript">
	import {mapGetters} from 'vuex';
	import {staticUrl} from '../../helpers';
	import SnippetsBoard from '../SnippetsBoard';

	export default {
		components: {
			SnippetsBoard,
		},

		asyncData: function(store) {
			return Promise.all([
				store.dispatch('snippets/fetchNew'),
				store.dispatch('snippets/search', {language: null, keywords: 'Discord'}),
				store.dispatch('snippets/search', {language: null, keywords: 'Dart'}),
			]);
		},

		data: function () {
			return {
				loading: true,
				error: false,
			};
		},

		computed: {
			...mapGetters('snippets', {
				newSnippets: 'getNew',
				getResults: 'getSearchResults',
			}),

			snippets() {
				return {
					_new: this.newSnippets.slice(0, 10),
					discord: this.getResults({keywords: 'Discord', language: null}).slice(0, 10),
					dart: this.getResults({keywords: 'Dart', language: null}).slice(0, 10),
				};
			},
		},

		methods: {
			staticUrl,
		},

		meta: {
			title: 'Discover the awesome and the new',

			meta: [
				{name: 'description', content: 'Discover new and cool snippets made by developers just like you, from around the entire world.'},
				{property: 'og:title', content: 'Discover the awesome and the new'},
				{property: 'og:description', content: 'Discover new and cool snippets made by developers just like you, from around the entire world.'},
			],
		},
	};
</script>

<style lang="scss" scoped>

</style>
