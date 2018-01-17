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
						<span>OAuth 2.0 clients</span>
						<router-link :to="{name: 'settings.oauth2.create-client'}" class="pull-right clickable" tag="span">
							Create new client
						</router-link>
					</div>
					<div class="card-body">
						<span v-if="clients.length < 1">
							You haven't created any clients yet.
						</span>
						<div class="table-responsive">
							<table class="table" v-if="clients.length > 0">
								<thead>
									<tr>
										<th>ID</th>
										<th>Name</th>
										<th>Secret</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="client in clients">
										<td>
											{{client.id}}
										</td>
										<td>
											{{client.name}}
										</td>
										<td>
											<code>{{client.secret}}</code>
										</td>
										<td>
											<button class="btn btn-danger btn-sm" type="button" @click="deleteClient(client)">Delete</button>
											<button class="btn btn-warning btn-sm" type="button" @click="editClient(client)">Edit</button>
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
				clients: [],
			};
		},

		beforeRouteEnter: function(to, from, next) {
			axios.get('/oauth/clients').then(response => {
				next(vm => vm.clients = response.data);
			});
		},

		methods: {
			deleteClient: function(client) {
				cookToast('Deleting client..', 3000);
				axios.delete('/oauth/clients/' + client.id)
					.then(response => {
						cookToast('Deleted!', 3000);
						axios.get('/oauth/clients').then(response => {
							this.clients = response.data;
						});
					}).catch(error => {
						cookToast('Failed to delete!', 3000);
					});
			},

			editClient: function(client) {
				this.$router.push({name: 'settings.oauth2.edit-client', params: {id: client.id}});
			},
		},

		meta: {
			title: 'Manage OAuth 2.0 applications',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},

		components: {
			'sidenav': Sidenav,
		},
	};
</script>
