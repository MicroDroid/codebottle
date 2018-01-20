<template>
	<div class="container">
		<div class="row">
			<div class="center-text col">
				<h2>Amplified Productivity</h2>
				<h4 class="text-muted">Modular reusable code <span class="green-text">+</span> code examples.</h4>
				<h4 class="text-muted">By the awesome community.</h4>
			</div>
			<hr>

			<div id="snippets-container" class="row">
				<div class="col-xs-12 col-sm-6 col-md-4" v-for="snippet in snippets">
					<router-link :to="{name: 'view-snippet', params: {id: snippet.id}}" class="nostyle">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">{{snippet.title}}</h5>
								<h6 class="card-subtitle mb-2 text-muted">
									<span class="fa fa-star"></span> {{snippet.votes}}
									<span class="fa fa-code"></span> {{snippet.language.name}}
									<span class="fa fa-eye"></span> {{snippet.views}}
									<span class="fa fa-clock-o"></span> {{moment(snippet.updatedAt).fromNow()}}
								</h6>
								<div class="card-text">
									{{snippet.description ? shorten(summarize(snippet.description), 200) : 'No description provided.'}}
								</div>
							</div>
						</div>
					</router-link>
				</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {shorten} from '../../helpers';
	import {mapState} from 'vuex';
	import summarize from 'summarize-markdown';

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

		mounted: function() {
			moment.updateLocale('en', {
				relativeTime: {
					future: 'in %s',
					past: '%s',
					s:  'seconds',
					ss: '%ss',
					m:  'a minute',
					mm: '%dm',
					h:  'an hour',
					hh: '%dh',
					d:  'a day',
					dd: '%dd',
					M:  'a month',
					MM: '%dM',
					y:  'a year',
					yy: '%dY'
				}
			});
		},

		destroyed: function() {
			moment.updateLocale('en', {
				relativeTime: {
					future: 'in %s',
					past: '%s ago',
					s:  'a few seconds',
					ss: '%s seconds',
					m:  'a minute',
					mm: '%d minutes',
					h:  'an hour',
					hh: '%d hours',
					d:  'a day',
					dd: '%d days',
					M:  'a month',
					MM: '%d months',
					y:  'a year',
					yy: '%d years'
				}
			});
		},

		methods: {
			moment: moment.utc,
			shorten, summarize,
		},

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

<style type="text/css" scoped>
	#snippets-container {
		margin-top: 24px;
		width: 100vw;
	}

	#snippets-container .card {
		height: 280px;
		margin-bottom: 48px;
		overflow: hidden;
	}

	.card-subtitle span {
		margin-left: 8px;
	}

	.card-subtitle span:first-child {
		margin-left: 0;
	}

	.green-text {
		color: #4caf50;
	}
</style>
