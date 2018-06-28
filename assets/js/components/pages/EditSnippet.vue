<template>
	<div class="container">
		<div class="col-xs-12 col-md-11 col-lg-9">
			<h1>Edit snippet</h1>
			<br>
			<form @submit.prevent="edit">
				<div class="form-group">
					<label for="title">Title</label>
					<input type="text" class="form-control" id="title" v-model="title" placeholder="Focus on keywords" autofocus required>
				</div>

				<div class="form-group">
					<label for="code">Code</label>
					<textarea type="text" class="form-control code-input" id="code" v-model="code" placeholder="Fancy stuff here" required />
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea type="text" class="form-control" id="description" v-model="description" placeholder="Be brief" />
				</div>

				<div class="form-group">
					<label for="explanation">Explanation</label>
					<input type="text" class="form-control" id="explanation" v-model="explanation" placeholder="Why did you make this edit?">
				</div>

				<div class="row">
					<div class="col">
						<div class="form-group">
							<label>Language</label>
							<dropdown :label="(languages.filter(l => l.id === language)[0] ? languages.filter(l => l.id === language)[0].name : 'Language')"
								:options="languages" @on-select="onLanguage" key-field="id" label-field="name" :selective="true" />
						</div>
					</div>
					<div class="col">
						<div class="form-group">
							<label>Snippet type</label>
							<dropdown :label="(categories.filter(c => c.id === category)[0] ? categories.filter(l => l.id === category)[0].name : 'Type')"
								:options="categories" @on-select="onCategory" :selective="true" key-field="id" label-field="name" />
						</div>
					</div>
				</div>
				<button class="btn btn-primary" type="submit" :disabled="loading">Save</button>
			</form>

			<loader v-if="loading" />
			<div class="alert alert-danger center-text" v-if="error">{{error}}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import Dropdown from '../bootstrap/Dropdown';
	import {mapState, mapGetters} from 'vuex';
	import {extractError, apiUrl} from '../../helpers';

	export default {
		data: function() {
			return {
				title: '',
				description: '',
				code: '',
				language: -1,
				category: -1,
				explanation: '',
				loading: false,
				error: false,
			};
		},

		computed: {
			...mapState([
				'languages',
				'categories',
			]),
			...mapGetters({
				snippetById: 'snippets/getById',
			}),
		},

		components: {
			'dropdown': Dropdown
		},

		asyncData: function(store, route) {
			return store.dispatch('snippets/fetch', route.params.id);
		},

		mounted: function() {
			const snippet = this.snippetById(this.$route.params.id);
			this.title = snippet.title;
			this.description = snippet.description;
			this.code = snippet.code;
			this.language = snippet.language.id;
			this.category = snippet.category.id;
		},

		methods: {
			onLanguage: function(item) {
				this.language = item.id;
			},

			onCategory: function(item) {
				this.category = item.id;
			},

			edit: function() {
				this.error = false;
				this.loading = true;

				axios.put(apiUrl('/snippets/' + this.$route.params.id), {
					title: this.title,
					description: this.description,
					code: this.code,
					language: this.language,
					category: this.category,
					explanation: this.explanation,
				}).then(response => {
					this.$router.push({name: 'view-snippet', params: {
						id: response.data.id
					}});
				}).catch(error => {
					this.loading = false;
					this.error = extractError(error);
				});
			}
		},

		meta: {
			title: 'Create a new snippet',

			meta: [
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>

<style type="text/css" scoped>
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