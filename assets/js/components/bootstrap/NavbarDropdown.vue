<template>
	<li ref="dropdown" :class="{show: open}" class="dropdown clickable nav-link" @click="toggle">
		<a class="dropdown-toggle">
			{{ selected && selective ? selected : label }} <span class="caret" />
		</a>
		<div :class="{show: open}" class="dropdown-menu">
			<a v-for="item in options" :key="item[keyField]" class="dropdown-item clickable" @click="select(item)">
				{{ item[labelField] }}
			</a>
		</div>
	</li>
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
			handleDocumentClick(e) {
				if (!this.$refs.dropdown.contains(e.target))
					this.open = false;
			},

			toggle() {
				this.open = !this.open;
			},

			select: function (item) {
				this.selected = item[this.labelField];
				this.$emit('on-select', item);
			},
		}
	};
</script>