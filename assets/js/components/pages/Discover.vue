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

		<SnippetsBoard :snippets="snippets" class="mt-3" />
	</div>
</template>

<script type="text/javascript">
	import {mapState} from 'vuex';
	import {staticUrl} from '../../helpers';
	import SnippetsBoard from '../SnippetsBoard';

	export default {
		components: {
			SnippetsBoard,
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
