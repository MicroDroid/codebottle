<template>
	<div id="app">
		<div id="main-content">
			<toast v-if="toast.content" :content="toast.content"></toast>
			<navbar></navbar>
			<router-view></router-view>
		</div>
		<footer>
			<span>
				<router-link :to="{name: 'api.getting-started'}">API</router-link>
				| <router-link :to="{name: 'embedding'}">Embedding</router-link>
				| <a href="https://discord.gg/2Sd8Um3" id="discord-invite">Discord</a>
				| <router-link :to="{name: 'privacy-policy'}">Privacy Policy</router-link>
				| Built with <span class="fa fa-heart" title="Oh you burnt it!"></span> by OverCoder
				| Proudly hosted by <a href="https://blackfields.net/">BFNT <span class="fa fa-globe" title="Globe!"></span></a>
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