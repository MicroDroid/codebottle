<template>
	<div class="container">
		<div class="col-12 col-md-11 col-lg-9">
			<h1>Edit snippet</h1>
			
			<form class="mt-4" @submit.prevent="edit">
				<div class="form-group">
					<label for="title">Title</label>
					<input id="title" v-model="title" type="text" class="form-control"
						placeholder="Focus on keywords" autofocus required>
				</div>

				<div class="form-group">
					<label for="code">Code</label>
					<textarea id="code" v-model="code" type="text" class="form-control code-input"
						placeholder="Fancy stuff here" required />
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea id="description" v-model="description" type="text" class="form-control description"
						placeholder="Be brief" />
				</div>

				<div class="form-group">
					<label for="explanation">Explanation</label>
					<input id="explanation" v-model="explanation" type="text" class="form-control"
						placeholder="Why did you make this edit?">
				</div>

				<div class="row">
					<div class="col">
						<div class="form-group">
							<label>Language</label>
							<dropdown :label="(languages.filter(l => l.id === language)[0] ? languages.filter(l => l.id === language)[0].name : 'Language')"
								:options="languages" :selective="true" key-field="id" label-field="name"
								@on-select="onLanguage" @j="k" />
						</div>
					</div>
					<div class="col">
						<div class="form-group">
							<label>Snippet type</label>
							<dropdown :label="(categories.filter(c => c.id === category)[0] ? categories.filter(l => l.id === category)[0].name : 'Type')"
								:options="categories" :selective="true" key-field="id" label-field="name"
								@on-select="onCategory" />
						</div>
					</div>
				</div>
				<button :disabled="loading" class="btn btn-primary" type="submit">Save</button>
			</form>

			<loader v-if="loading" class="mt-5" />
			<div v-if="error" class="alert alert-danger text-center mt-5">{{ error }}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import Dropdown from '../bootstrap/Dropdown';
	import {mapState, mapGetters} from 'vuex';
	import {extractError, apiUrl} from '../../helpers';

	export default {
		components: {
			'dropdown': Dropdown
		},

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

<style lang="scss" scoped>
	.code-input {
		height: 30vh;
	}

	.description {
		height: 20vh;
	}
</style>