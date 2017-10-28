<template>
	<ul class="nav nav-pills nav-fill flex-column" id="sidenav">
		<li class="nav-item">
			<router-link :to="{name: 'settings.preferences'}" class="nav-link">
				Preferences
			</router-link>
		</li>
		<li class="nav-item">
			<router-link :to="{name: 'settings.oauth2'}" class="nav-link">
				OAuth 2.0 Applications
			</router-link>
		</li>
		<li class="nav-item">
			<router-link :to="{name: 'settings.personal-access-tokens'}" class="nav-link">
				Personal access tokens
			</router-link>
		</li>
	</ul>
</template>

<style type="text/css" scoped>
	#sidenav li {
		text-align: left;
	}

	@media (max-width: 767px) {
		#sidenav li {
			text-align: center;
		}

		#sidenav {
			margin-bottom: 24px;
		}
	}
</style>