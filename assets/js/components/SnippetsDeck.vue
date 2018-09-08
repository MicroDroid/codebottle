<template>
	<div>
		<div id="snippets-container" class="row">
			<div class="col-xs-12 col-sm-6 col-md-4" v-for="snippet in snippets" :key="snippet.id">
				<router-link :to="{name: 'view-snippet', params: {id: snippet.id}}" class="nostyle">
					<div class="card">
						<div class="card-body">
							<h5 class="card-title">{{snippet.title}}</h5>
							<h6 class="card-subtitle mb-2 text-muted">
								<span class="far fa-star" /> {{snippet.votes}}
								<span class="far fa-code" /> {{snippet.language.name}}
								<span class="far fa-eye" /> {{snippet.views}}
								<span class="far fa-clock" /> {{moment(snippet.updatedAt).fromNow()}}
							</h6>
							<div class="card-text">
								<p v-if="snippet.description && summarize(snippet.description)">
									{{ shorten(summarize(snippet.description), 200) }}
								</p>
								<em v-else class="no-description">
									{{ !snippet.description ? 'No description provided.' : 'Description is in form of code.' }}
								</em>
							</div>
						</div>
					</div>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {shorten} from '../helpers';
	import summarize from 'summarize-markdown';

	export default {
		props: {
			snippets: {
				type: Array,
				required: true
			}
		},

		methods: {
			moment: moment.utc,
			shorten, summarize
		}
	};
</script>

<style scoped>
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

	.no-description {
		color: rgba(255, 255, 255, 0.5);
	}
</style>
