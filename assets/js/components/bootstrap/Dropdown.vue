<template>
	<div :class="{dropdown: true, show: open}">
		<button type="button" class="btn btn-primary dropdown-toggle" @click="toggle" @blur="hide">
			{{selected && selective ? selected : label}} <span class="caret"></span>
		</button>

		<div :class="{'dropdown-menu': true, 'show': open}" role="menu">
			<a class="dropdown-item clickable" v-for="item in options" @mousedown="select(item)">
				{{item[labelField ? labelField : 'label']}}
			</a>
		</div>
	</div>
</template>


<script type="text/javascript">
	export default {
		props: [
			'label',
			'options',
			'on-select',
			'selective',
			'label-field',
		],

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
				this.selected = item[this.labelField ? this.labelField : 'label'];
				if (this.onSelect)
					this.onSelect(item);
			},
		},
	};
</script>