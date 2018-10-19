<template>
	<li :class="{show: open}" class="dropdown clickable nav-link" @click="toggle" @blur="hide">
		<a class="dropdown-toggle">
			{{ selected && selective ? selected : label }} <span class="caret" />
		</a>
		<div :class="{show: open}" class="dropdown-menu">
			<a v-for="item in options" :key="item[keyField]" class="dropdown-item clickable" @mousedown="select(item)">
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

		methods: {
			toggle() {
				this.open = !this.open;
			},

			hide() {
				this.open = false;
			},

			select: function (item) {
				this.selected = item[this.labelField];
				this.$emit('on-select', item);
			},
		}
	};
</script>