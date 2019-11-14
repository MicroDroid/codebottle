<template>
	<div class="container">
		<form class="form-inline" @submit.prevent="create">
			<input v-model="name" type="text" class="form-control" placeholder="Language">

			<button :disabled="creating" type="submit" class="btn btn-primary ml-2">
				Add
			</button>
		</form>
		<hr>
		<ul>
			<li v-for="language in languages" :key="language.id">
				{{ language.name }}
				(<a href="javascript:undefined" @click="deleteLanguage(language.id)">remove</a>)
			</li>
		</ul>
	</div>
</template>

<script>
	import { extractError } from '../../../helpers';
	import { mapState } from 'vuex';

	export default {
		data() {
			return {
				name: '',
				creating: false,
			};
		},

		asyncData(store) {
			return store.dispatch('languages/fetchAll');
		},

		computed: {
			...mapState('languages', {
				languages: state => state.languages,
			}),
		},

		methods: {
			create() {
				this.creating = true;

				this.$store.dispatch('languages/create', {
					name: this.name,
				}).then(() => {
					this.name = '';
				}).catch(e => {
					this.$store.dispatch('toasts/addToast', {
						content: extractError(e),
						duration: 3000,
					});
				}).finally(() => {
					this.creating = false;
				});
			},

			deleteLanguage(id) {
				const { name } = this.languages.find(l => l.id === id);

				if (!confirm(`You sure you want to delete '${name}' language?`))
					return;

				this.$store.dispatch('languages/delete', {
					id,
				}).catch(e => {
					this.$store.dispatch('toasts/addToast', {
						content: extractError(e),
						duration: 3000,
					});
				});
			},
		},

		meta: {
			title: 'Languages',

			meta: [
				{ name: 'description', content: 'View and manage languages on CodeBottle' },
				{ property: 'og:title', content: 'Languages / CodeBottle' },
				{ property: 'og:description', content: 'View and manage languages on CodeBottle' },
			],
		},
	};
</script>
