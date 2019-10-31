<template>
	<div id="app">
		<iframe src="https://canary.discordapp.com/widget?id=222487241321086976&theme=dark"
			width="320"
			height="480"
			allowtransparency="true"
			frameborder="0"
			class="discord-embed d-none d-lg-block"
		/>

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
				{ property: 'og:image', content: '/images/bottle_square.png', vmid: 'image' },
			],
		},

		components: {
			Toast,
			'custom-footer': Footer,
		},
	};
</script>

<style lang="scss" scoped>
	.discord-embed {
		position: fixed;
		right: 7.5vw;
		bottom: -406px;

		transition: bottom 0.3s ease;

		z-index: 10000;

		&:hover {
			bottom: 0px;
		}
	}
</style>