<template>
	<div id="app">
		<div id="main-content">
			<toast v-if="toast.content" :content="toast.content" />
			<navbar />
			<router-view />
		</div>
		<footer>
			<span>
				<router-link :to="{name: 'api.getting-started'}">API</router-link>
				| <router-link :to="{name: 'embedding'}">Embedding</router-link>
				| <a href="https://discord.gg/2Sd8Um3" target="_blank" id="discord-invite">Discord</a>
				| <router-link :to="{name: 'privacy-policy'}">Privacy Policy</router-link>
				| Built with <span class="fas fa-heart" title="Oh you burnt it!" /> by <a href="https://microdroid.github.io/" target="_blank">OverCoder</a>
				| Proudly hosted by <a href="https://blackfields.net/" target="_blank">BFNT <span class="fal fa-globe" title="Globe!" /></a>
			</span>
		</footer>
	</div>
</template>

<script type="text/javascript">
	import Toast from './Toast';
	import {mapGetters} from 'vuex';

	export default {
		components: {
			Toast,
		},

		computed: {
			...mapGetters([
				'toast',
			])
		},

		meta: {
			title: '404',
			titleTemplate: '%s | CodeBottle',
			meta: [
				{property: 'og:image', content: '/images/bottle_square.png', vmid: 'image'},
			],
		}
	};
</script>