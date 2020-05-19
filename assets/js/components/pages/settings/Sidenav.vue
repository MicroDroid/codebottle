<template>
	<ul class="nav nav-pills nav-fill flex-column mb-3">
		<li class="nav-item text-center text-md-left">
			<router-link :to="{name: 'settings.preferences'}" class="nav-link">
				Preferences
			</router-link>
		</li>
		<li class="nav-item text-center text-md-left">
			<router-link :to="{name: 'settings.account-management'}" class="nav-link">
				Account management
			</router-link>
		</li>
	</ul>
</template>