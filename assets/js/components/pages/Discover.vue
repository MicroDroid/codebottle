<template>
	<div class="container">
		<div class="row">
			<div class="center-text col">
				<h2>Amplified Productivity</h2>
				<h4 class="text-muted">Modular reusable code <span class="green-text">+</span> code examples.</h4>
				<h4 class="text-muted">By the awesome community.</h4>
			</div>
			<hr>

			<snippets-deck id="deck" :snippets="snippets" v-if="snippets"></snippets-deck>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {mapState} from 'vuex';
	import SnippetsDeck from '../SnippetsDeck';

	export default {
		asyncData: function(store, route) {
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

		components: {
			'snippets-deck': SnippetsDeck,
		}
	};
</script>

<style type="text/css" scoped>
	.green-text {
		color: #4caf50;
	}

	#deck {
		margin-top: 24px;
	}
</style>
