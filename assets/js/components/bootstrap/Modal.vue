<template>
	<div :class="{'modal': true, show}">
		<div class="modal-dialog" v-if="show">
			<div class="modal-content">
				<div class="modal-header">
					<slot name="header"></slot>
					<h5 class="modal-title" v-if="title">{{title}}</h5>
					<button type="button" class="close" @click="dismiss">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<slot></slot>
				</div>
				<div class="modal-footer">
					<slot name="footer"></slot>
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

<style scoped>
	.modal.show {
		display: block;
		background: rgba(0,0,0,0.6);
	}

	.modal-content {
		top: 10vh;
		text-align: left;
	}

	.close {
		color: #CCC;
	}
</style>
