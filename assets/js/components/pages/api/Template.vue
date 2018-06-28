<template>
	<div class="container">
		<div class="row">
			<div class="col-xs-12 col-4 order-xs-1 order-2">
				<sidenav />
			</div>
			<div class="col-xs-12 col-8 order-xs-2 order-1" v-html="parsed" />
		</div>
	</div>
</template>

<script type="text/javascript">
	import Sidenav from './Sidenav.vue';
	import {highlightCode} from '../../../helpers';

	export default {
		props: {
			title: {
				type: String,
				required: true,
			},
			description: {
				type: String,
				required: true,
			},
			content: {
				type: String,
				required: true,
			}
		},

		computed: {
			parsed: function() {
				return marked(this.content);
			},
		},

		components: {
			'sidenav': Sidenav,
		},

		meta: function() {
			return {
				title: `${this.title} - API`,

				meta: [
					{name: 'description', content: this.description},
					{property: 'og:title', content: `${this.title} - API`},
					{property: 'og:description', content: this.description},
				],
			};
		},

		mounted: function() {
			highlightCode();
		},
		
		updated: function() {
			highlightCode();
		},
	};
</script>
