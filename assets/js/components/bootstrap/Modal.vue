<template>
	<div :class="{show}" class="modal">
		<div v-if="show" class="modal-dialog">
			<div class="modal-content text-left">
				<div class="modal-header">
					<slot name="header" />
					<h5 v-if="title" class="modal-title">
						{{ title }}
					</h5>
					<button type="button" class="close text-muted" @click="dismiss">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<slot />
				</div>
				<div class="modal-footer">
					<slot name="footer" />
				</div>
			</div>
		</div>
	</div>
</template>


<script type="text/javascript">
	export default {
		props: {
			show: {
				type: Boolean,
				required: true,
			},

			title: {
				type: String,
				required: true,
			}
		},

		methods: {
			dismiss: function() {
				this.$emit('on-dismiss');
			}
		}
	};
</script>

<style lang="scss" scoped>
	.modal.show {
		display: block;
		background: rgba(0,0,0,0.6);
	}

	.modal-content {
		top: 10vh;
	}
</style>
