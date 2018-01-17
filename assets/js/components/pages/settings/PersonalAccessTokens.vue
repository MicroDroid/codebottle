<template>
	<div class="container">
		<div class="row">
			<div class="col-xs-12 col-md-3">
				<sidenav></sidenav>
			</div>
			<div class="col-xs-12 col-md-9">
				<!-- Clients -->
				<div class="card">
					<div class="card-header">
						<span>Personal Acccess Tokens</span>
						<router-link :to="{name: 'settings.personal-access-tokens.create-token'}" class="pull-right clickable" tag="span">
							Create new token
						</router-link>
					</div>
					<div class="card-body">
						<span v-if="tokens.length < 1">
							You haven't created any tokens yet.
						</span>
						<div class="table-responsive">
							<table class="table" v-if="tokens.length > 0">
								<thead>
									<tr>
										<th>Name</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="token in tokens">
										<td>
											{{token.name}}
										</td>
										<td>
											<button class="btn btn-danger btn-sm" type="button" @click="revokeToken(token)">Delete</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {cookToast} from '../../../helpers';
	import Sidenav from './Sidenav';

	export default {
		data: function () {
			return {
				tokens: [],
			};
		},

		beforeRouteEnter: function(to, from, next) {
			axios.get('/oauth/personal-access-tokens')
				.then(response => {
					next(vm => vm.tokens = response.data);
				}).catch(error => {
					cookToast('Error!', 2000);
				});
		},

		methods: {
			revokeToken: function(token) {
				cookToast('Deleting token..', 3000);
				axios.delete('/oauth/personal-access-tokens/' + token.id)
					.then(response => {
						cookToast('Deleted!', 3000);
						axios.get('/oauth/personal-access-tokens').then(response => {
							this.tokens = response.data;
						});
					}).catch(error => {
						cookToast('Failed to delete!', 3000);
					});
			},
		},

		meta: {
			title: 'Manage personal access tokens',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},

		components: {
			'sidenav': Sidenav,
		},
	};
</script>
