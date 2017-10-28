<template>
	<div class="container">
		<div class="col-xs-12 col-md-7">
			<h1>Create snippet</h1>
			<br/>
			<form @submit.prevent="create">
				<div class="form-group">
					<label for="title">Title</label>
					<input type="text" class="form-control" id="title" v-model="title" placeholder="Focus on keywords" autofocus required>
				</div>

				<div class="form-group">
					<label for="code">Code</label>
					<textarea type="text" class="form-control code-input" id="code" v-model="code" placeholder="Fancy stuff here" required></textarea>
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea type="text" class="form-control" id="description" v-model="description" placeholder="Be brief"></textarea>
				</div>

				<div class="row">
					<div class="col">
						<div class="form-group">
							<label>Language</label>
							<dropdown label="Language" :options="languages" :onSelect="onLanguage" :selective="true" labelField="name"></dropdown>
						</div>
					</div>
					<div class="col">
						<div class="form-group">
							<label>Snippet type</label>
							<dropdown label="Type" :options="categories" :onSelect="onCategory" :selective="true" labelField="name"></dropdown>
						</div>
					</div>
				</div>
				<button class="btn btn-primary" @click="create" type="submit" :disabled="loading">Create</button>
			</form>

			<loader v-if="loading" />
			<div class="alert alert-danger center-text" v-if="error">{{error}}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import Dropdown from '../bootstrap/Dropdown';
	import {mapState} from 'vuex';
	import {extractError, apiUrl} from '../../helpers';

	export default {
		data: function() {
			return {
				title: '',
				description: '',
				code: '',
				language: -1,
				category: -1,
				loading: false,
				error: false,
			}
		},

		computed: mapState([
			'languages',
			'categories',
		]),

		components: {
			'dropdown': Dropdown
		},

		methods: {
			onLanguage: function(item) {
				this.language = item.id;
			},

			onCategory: function(item) {
				this.category = item.id;
			},

			create: function() {
				this.error = false;
				this.loading = true;

				axios.post(apiUrl('/snippets'), {
					title: this.title,
					description: this.description,
					code: this.code,
					language: this.language,
					category: this.category,
				}).then(response => {
					this.$router.push({name: 'view-snippet', params: {
						id: response.data.data.id
					}});
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				})
			}
		},

		head: {
			title: {
				inner: "Create a new snippet",
			},

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},
	}
</script>

<style type="text/css">
	#code {
		height: 30vh;
	}

	#description {
		height: 20vh;
	}

	form {
		margin-bottom: 42px;
	}
</style>