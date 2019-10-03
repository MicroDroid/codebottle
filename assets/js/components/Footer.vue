<template>
	<footer>
		<span>
			<router-link :to="{name: 'api.getting-started'}">API</router-link>
			| <router-link :to="{name: 'support'}" class="support-link">Support</router-link>
			| <router-link :to="{name: 'embedding'}">Embedding</router-link>
			| <a href="https://discord.gg/2Sd8Um3" target="_blank" class="discord-invite">Discord</a>
			| <router-link :to="{name: 'privacy-policy'}">Privacy Policy</router-link>
			| Built with <span class="fas fa-heart" title="Oh you burnt it!" /> by <a href="https://overcoder.dev/" target="_blank">OverCoder</a>
			| Made possible with <a href="https://twitter.com/Xenthys" target="_blank">Xenthys</a>
		</span>
	</footer>
</template>

<style lang="scss" scoped>
	footer {
		padding: 1.25rem;
		text-align: center;
		color: #A0A0A7;
		font-size: 12px;

		.fa-heart {
			color: #E91E63;
		}

		.discord-invite {
			color: #7187d2;
		}

		.support-link {
			color: #ffeb3b;
		}

		a, a:hover, a:focus, a:visited {
			color: #A0A0A7;
		}
	}
</style>
