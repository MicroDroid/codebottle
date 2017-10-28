<template>
	<ul>
		<li>
			<router-link :to="{name: 'api.getting-started'}"> Getting started</router-link>
		</li>
		<li>
			<router-link :to="{name: 'api.authentication'}"> Authentication</router-link>
		</li>
		<li>
			<router-link :to="{name: 'api.languages'}"> Languages</router-link>
		</li>
		<li>
			<router-link :to="{name: 'api.categories'}"> Categories</router-link>
		</li>
		<li>
			<router-link :to="{name: 'api.snippets'}"> Snippets</router-link>
		</li>
	</ul>
</template>