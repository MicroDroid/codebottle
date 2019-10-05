<template>
	<div ref="dropdown" :class="{show: open}" class="dropdown">
		<button type="button" class="btn btn-primary dropdown-toggle" @click="toggle">
			{{ selected && selective ? selected : label }}
			<span class="caret" />
		</button>

		<div :class="{show: open}" class="dropdown-menu" role="menu">
			<a v-for="item in options" :key="item[keyField]" class="dropdown-item clickable" @click="select(item)">
				{{ item[labelField] }}
			</a>
		</div>
	</div>
</template>


<script type="text/javascript">
	export default {
		props: {
			label: {
				type: String,
				required: true,
			},
			options: {
				type: Array,
				required: true,
			},
			selective: {
				type: Boolean,
				required: false,
				default: false,
			},
			labelField: {
				type: String,
				required: false,
				default: 'label'
			},
			keyField: {
				type: String,
				required: false,
				default: 'key'
			},
		},

		data: () => ({
			open: false,
			selected: false,
		}),

		mounted() {
			document.addEventListener('click', this.handleDocumentClick);
		},

		beforeDestroy() {
			document.removeEventListener('click', this.handleDocumentClick);
		},

		methods: {
			toggle() {
				this.open = !this.open;
			},

			handleDocumentClick(e) {
				if (!this.$refs.dropdown.contains(e.target))
					this.open = false;
			},

			select: function (item) {
				this.selected = item[this.labelField];
				this.$emit('on-select', item);
			},
		},
	};
</script>