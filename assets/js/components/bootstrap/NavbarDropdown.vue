<template>
	<li :class="{'nav-link': true, dropdown: true, show: open, clickable: true}" @click="toggle" @blur="hide">
		<a class="dropdown-toggle">
			{{selected && selective ? selected : label}} <span class="caret"></span>
		</a>
		<div :class="{'dropdown-menu': true, 'show': open}">
			<a class="dropdown-item clickable" v-for="item in options" @mousedown="select(item)">
				{{item[labelField ? labelField : 'label']}}
			</a>
		</div>
	</li>
</template>


<script type="text/javascript">
	export default {
		props: [
			'label',
			'options',
			'onSelect',
			'selective',
			'labelField',
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
		}
	}
</script>