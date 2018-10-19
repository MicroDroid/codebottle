<template>
	<div class="container">
		<div class="row">
			<div class="text-center col">
				<h2>Amplified Productivity</h2>
				<h4 class="text-muted">Modular reusable code <span class="green-text">+</span> code examples.</h4>
				<h4 class="text-muted">By the awesome community.</h4>
			</div>
			<hr>

			<snippets-deck v-if="snippets" :snippets="snippets" class="mt-4" />
		</div>
	</div>
</template>

<script type="text/javascript">
	import {mapState} from 'vuex';
	import SnippetsDeck from '../SnippetsDeck';

	export default {
		components: {
			'snippets-deck': SnippetsDeck,
		},
		
		asyncData: function(store) {
			return store.dispatch('snippets/fetchNew');
		},
		
		data: function () {
			return {
				loading: true,
				error: false,
			};
		},

		computed: mapState({
			snippets: state => state.snippets.new,
		}),

		meta: {
			title:'Discover the awesome and the new',

			meta: [
				{name: 'description', content: 'Discover new and cool snippets made by developers just like you, from around the entire world.'},
				{property: 'og:title', content: 'Discover the awesome and the new'},
				{property: 'og:description', content: 'Discover new and cool snippets made by developers just like you, from around the entire world.'},
			],
		},
	};
</script>

<style lang="scss" scoped>
	.green-text {
		color: #4caf50;
	}
</style>
