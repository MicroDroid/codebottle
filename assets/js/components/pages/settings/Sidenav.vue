<template>
	<ul class="nav nav-pills nav-fill flex-column mb-3">
		<li class="nav-item text-center text-md-left">
			<router-link :to="{name: 'settings.preferences'}" class="nav-link">
				Preferences
			</router-link>
		</li>
		<!-- <li class="nav-item">
			<router-link :to="{name: 'settings.oauth2'}" class="nav-link">
				OAuth 2.0 Applications
			</router-link>
		</li>
		<li class="nav-item">
			<router-link :to="{name: 'settings.personal-access-tokens'}" class="nav-link">
				Personal access tokens
			</router-link>
		</li> -->
	</ul>
</template>