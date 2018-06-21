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
			<ul>
				<li>
					<router-link :to="{name: 'api.snippet-revisions'}"> Revisions</router-link>
				</li>
			</ul>
		</li>
	</ul>
</template>