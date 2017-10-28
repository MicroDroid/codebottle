<template>
	<span id="toast" class="unselectable">
		{{content}}
	</span>
</template>

<script type="text/javascript">
	export default {
		props: {
			content: {
				type: String,
				required: true,
			},
		},
	}
</script>

<style scoped>
	#toast {
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
		color: #444;
	}
</style>