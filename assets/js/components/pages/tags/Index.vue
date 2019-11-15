<template>
	<div class="container">
		<form class="form-inline" @submit.prevent="create">
			<input v-model="name" type="text" class="form-control" placeholder="Tag">

			<button :disabled="creating" type="submit" class="btn btn-primary ml-2">
				Add
			</button>
		</form>
		<hr>
		<ul>
			<li v-for="tag in tags" :key="tag.id">
				{{ tag.name }}
				(<a href="javascript:undefined" @click="deleteTag(tag.id)">remove</a>)
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
			return store.dispatch('tags/fetchAll');
		},

		computed: {
			...mapState('tags', {
				tags: state => state.tags,
			}),
		},

		methods: {
			create() {
				this.creating = true;

				this.$store.dispatch('tags/create', {
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

			deleteTag(id) {
				const { name } = this.tags.find(l => l.id === id);

				if (!confirm(`You sure you want to delete '${name}' tag?`))
					return;

				this.$store.dispatch('tags/delete', {
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
			title: 'Tag',

			meta: [
				{ name: 'description', content: 'View and manage tags on CodeBottle' },
				{ property: 'og:title', content: 'Tags / CodeBottle' },
				{ property: 'og:description', content: 'View and manage tags on CodeBottle' },
			],
		},
	};
</script>
