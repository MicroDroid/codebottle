<template>
	<span v-if="show" class="bread">
		{{ toast.content }}
	</span>
</template>

<script type="text/javascript">
	import { mapGetters } from 'vuex';

	export default {
		data() {
			return {
				show: false,
			};
		},

		computed: {
			...mapGetters({
				toast: 'toasts/firstToast',
			}),
		},

		watch: {
			toast: {
				handler(newToast) {
					if (!newToast) { // There are no more toasts left to show
						this.show = false;
						return;
					}

					this.show = true;

					setTimeout(() => {
						this.$store.dispatch('toasts/removeToast', newToast.id);
					}, newToast.duration);
				},

				immediate: true,
			},
		},
	};
</script>

<style scoped>
	/* thanks bootstrap */
	.bread {
		position: absolute;
		top: 5vh;
		left: 50%;
		padding: 4px 8px;
		transform: translateX(-50%);
		border-radius: 1px;
		background: #e2d45a;
		z-index: 10000;
		box-shadow: 0px 3px 3px rgba(0,0,0,.25);
		border: 1px solid #e0d050;
		color: #443e0f;
	}
</style>