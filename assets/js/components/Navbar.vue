<template>
	<div>
		<nav class="navbar navbar-toggleable-md navbar-light bg-faded fixed-top d-xs-none d-sm-none d-md-block d-lg-block d-xl-block navbar-expand-md navbar-expand-lg navbar-expand-xl">
			<div class="container">
				<router-link :to="{name: 'discover'}" class="navbar-brand">
					<img :src="staticUrl('/images/bottle_square.png')" alt="CB" height="34" title="CodeBottle">
				</router-link>

				<form @submit.prevent="search">
					<input type="text" class="form-control" placeholder="Search" v-model="keywords">
				</form>

				<ul class="nav navbar-nav ml-3 mr-auto">
					<router-link :to="{name: 'discover'}" tag="li" class="nav-item">
						<a class="nav-link">Discover</a>
					</router-link>
					<router-link :to="{name: 'create'}" tag="li" class="nav-item">
						<a class="nav-link">Create</a>
					</router-link>
				</ul>

				<!-- Unprotected links -->
				<ul class="nav navbar-nav" v-if="!isAuthenticated">
					<li class="nav-item">
						<router-link :to="{name: 'signup'}" class="nav-link">Sign up</router-link>
					</li>
					<li class="nav-item">
						<router-link :to="{name: 'signin'}" class="nav-link">Sign in</router-link>
					</li>
				</ul>

				<!-- Protected links -->
				<ul class="nav navbar-nav" v-if="isAuthenticated">
					<navbar-dropdown :label="'Hey ' + username + '!'"
						:options="userOptions"
						:onSelect="onUserAction"></navbar-dropdown>
				</ul>
			</div>
		</nav>

		<nav class="navbar navbar-toggleable-md navbar-light bg-faded fixed-top mobile-navbar d-xs-block d-sm-block d-md-none d-lg-none d-xl-none">
			<div>
				<div class="row">
					<div class="col-auto">
						<a class="navbar-brand ml-3" href="javascript:undefined" @click="toggleMenu">
							<i class="fal fa-bars" aria-hidden="true"></i>
						</a>
					</div>
					<div class="col">
						<form @submit.prevent="search">
							<input type="text" class="form-control" placeholder="Search" v-model="keywords">
						</form>
					</div>
				</div>

				<div class="row nav">
					<router-link :to="{name: 'discover'}" tag="div" class="nav-item col" exact>
						<a class="nav-link">Discover</a>
					</router-link>
					<router-link :to="{name: 'create'}" tag="div" class="nav-item col">
						<a class="nav-link">Create</a>
					</router-link>
				</div>

				<!-- Unprotected links -->
				<div class="navbar-menu" v-if="showMenu && !isAuthenticated">
					<router-link :to="{name: 'signup'}" class="nav-link">
						Sign up
					</router-link>
					<router-link :to="{name: 'signin'}" class="nav-link">
						Sign in
					</router-link>
				</div>

				<!-- Protected links -->
				<ul class="navbar-menu" v-if="showMenu && isAuthenticated">
					<navbar-dropdown :label="'Hey ' + username + '!'"
						:options="userOptions"
						:onSelect="onUserAction"></navbar-dropdown>
				</ul>
			</div>
		</nav>
	</div>
</template>

<script type="text/javascript">
	import {mapGetters, mapState} from 'vuex';
	import NavbarDropdown from './bootstrap/NavbarDropdown';
	import {staticUrl} from '../helpers';

	export default {
		data: () => ({
			showMenu: false,
			keywords: '',
			userOptions: [
				{label: 'View profile', key: 'view-profile'},
				{label: 'Edit profile', key: 'edit-profile'},
				{label: 'Settings', key: 'settings'},
				{label: 'Sign out', key: 'sign-out'},
			],
		}),

		computed: {
			...mapGetters({
				isAuthenticated: 'auth/isAuthenticated',
			}),

			...mapState({
				username: state => state.users.self.username,
			}),
		},

		methods: {
			toggleMenu: function() {
				this.showMenu = !this.showMenu;
			},

			search: function() {
				this.$router.push({name: 'search', query: {q: this.keywords}});
				this.keywords = '';
			},

			onUserAction: function(item) {
				switch(item.key) {
					case 'sign-out':
						this.$store.dispatch('auth/logout');
						if (this.$route.meta.requiresAuth)
							this.$router.push({name: 'search'});
						break;
					case 'settings':
						this.$router.push({name: 'settings.preferences'});
						break;
					case 'view-profile':
						this.$router.push({name: 'view-user', params: {username: this.username}});
						break;
					case 'edit-profile':
						this.$router.push({name: 'edit-profile'});
						break;
				}
			},

			staticUrl,
		},

		mounted: function() {
			this.$router.afterEach(() => {
				this.showMenu = false;
			});
		},

		components: {
			'navbar-dropdown': NavbarDropdown,
		}
	};
</script>

<style type="text/css" scoped>
	.form-control {
		max-width: 320px;
		padding: .5rem .75rem;
	}

	form {
		margin-bottom: 0;
	}
</style>