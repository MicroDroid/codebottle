<template>
	<div :class="{dropdown: true, show: open}">
		<button type="button" class="btn btn-primary dropdown-toggle" @click="toggle" @blur="hide">
			{{selected && selective ? selected : label}} <span class="caret"></span>
		</button>

		<div :class="{'dropdown-menu': true, 'show': open}" role="menu">
			<a class="dropdown-item clickable" v-for="item in options" @mousedown="select(item)">
				{{item[labelField]}}
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
		},
	};
</script>