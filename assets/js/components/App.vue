<template>
	<div id="app">
		<div id="main-content">
			<toast />
			<navbar />
			<router-view />
		</div>
		<custom-footer />
	</div>
</template>

<script type="text/javascript">
	import Toast from './Toast';
	import Footer from './Footer';

	export default {
		meta: {
			title: '404',
			titleTemplate: '%s / CodeBottle',
			meta: [
				{property: 'og:image', content: '/images/bottle_square.png', vmid: 'image'},
			],
		},

		components: {
			Toast,
			'custom-footer': Footer,
		},
	};
</script>
