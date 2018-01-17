<template>
	<div class="container">
		<h1 id="title">404</h1>
		<h3>You've taken the wrong route.</h3>
	</div>
</template>

<script type="text/javascript">
	export default {
		meta: {
			title: 'Not found!',

			meta: [
				{name: 'robots', content: 'noindex'},
				{name: 'prerender-status-code', content: '404'},
			],
		},
	};
</script>

<style type="text/css" scoped>
	.container {
		text-align: center;
	}

	#title {
		font-weight: bold;
		font-size: 72px;
	}
</style>