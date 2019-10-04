<template>
	<div>
		<div class="table d-table">
			<router-link v-for="snippet in snippets" :key="snippet.id"
				:to="{name: 'view-snippet', params: {id: snippet.id}}"
				class="d-table-row">
				<div>
					{{ snippet.title }}
				</div>

				<div class="d-none d-md-table-cell">
					<span class="fa fa-fw fa-code mr-2" />
					{{ snippet.language.name }}
				</div>

				<div :class="{
						'text-success': snippet.votes > 0,
						'text-danger': snippet.votes < 0,
					}"
					class="d-none d-md-table-cell">
					<span :class="{
							'fa-chevron-up': snippet.votes >= 0,
							'fa-chevron-down': snippet.votes < 0,
						}"
						class="fa fa-fw fas mr-2"/>

					{{ snippet.votes > 0 ? `+${snippet.votes}` : snippet.votes }} votes
				</div>
				<div class="d-none d-md-table-cell">
					<span class="fa fa-fw fa-eye mr-2" />
					{{ snippet.views }} views
				</div>
			</router-link>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			snippets: {
				type: Array,
				required: true,
			}
		},
	};
</script>

<style lang="scss" scoped>
	a {
		color: #ccc;
		text-decoration: none;
	}

	.table {
		border-collapse: collapse;

		> a {
			border-bottom: 1px solid #252525;

			&:hover {
				background: #1a1a1a;
			}

			> div {
				padding-top: 0.5rem;
				padding-bottom: 0.5rem;

				&:first-child {
					padding-left: 0;
				}

				&:last-child {
					padding-right: 0;
				}
			}
		}
	}
</style>