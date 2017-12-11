<template>
	<div class="container">
		<div class="row">
			<div class="col-xs-12 col-md-10 col-lg-9">
				<h1>Create new token</h1>
				<form @submit.prevent="create">
					<input class="form-control" placeholder="Name" v-model="name" ref="nameInput">
					
					<!-- <div class="form-group" v-if="scopes.length > 0">
						<label class="col-md-4 control-label">Scopes</label>

						<div class="col-md-6">
							<div v-for="scope in scopes">
								<div class="checkbox">
									<label>
										<input type="checkbox"
											@click="toggleScope(scope.id)"
											:checked="scopeIsAssigned(scope.id)">

											{{ scope.id }}
									</label>
								</div>
							</div>
						</div>
					</div> -->

					<button class="btn btn-primary" type="submit" ref="createBtn">Create token</button>
					<loader v-if="loading"/>
					<div class="alert alert-danger" id="errors" v-if="errors">
						<span v-if="errors.length === 1">{{errors[0]}}</span>
						<ul v-if="errors.length > 1">
							<li v-for="error in errors">{{error}}</li>
						</ul>
					</div>
				</form>
				<p v-if="created">
					There's your token: <br/>
					<pre><code>{{accessToken}}</code></pre> <br>
					Save this somewhere safe, you <strong>cannot</strong> retrieve this later.
				</p>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {cookToast} from '../../../helpers';
	
	export default {
		data: function () {
			return {
				name: '',
				scopes: [],
				accessToken: false,
				created: false,
				loading: false,
				errors: false,
			};
		},

		beforeRouteEnter: function(to, from, next) {
			axios.get('/oauth/scopes')
				.then(response => {
					next(vm => vm.scopes = response.data);
				}).catch(error => {
					cookToast('Error!', 2000);
				});
		},

		mounted: function() {
			this.$refs.nameInput.focus();
		},

		methods: {
			create: function() {
				this.$refs.createBtn.disabled = true;
				this.errors = false;
				this.loading = true;

				axios.post('/oauth/personal-access-tokens', {
					name: this.name,
				}).then(response => {
					this.loading = false;
					this.created = true;
					this.accessToken = response.data.accessToken;
				}).catch(error => {
					this.loading = false;
					
					if (error.response) {
						if (error.response.status === 422) {
							this.errors = [
								...(error.response.data.name || []),
							];
						}
					} else {
						this.errors = ['Network error!'];
					}

					this.$refs.createBtn.disabled = false;
				});
			}
		},

		head: {
			title: {
				inner: 'Create a personal access token',
			},

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},

		updated: function() {
			$('pre code:not(.hljs)').each((i, b) => {
				hljs.highlightBlock(b);
			});
		}
	};
</script>

<style type="text/css" scoped>
	form > * {
		margin-top: 24px;
	}

	#errors ul {
		margin: 0;
	}
</style>