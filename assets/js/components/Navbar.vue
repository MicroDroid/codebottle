<template>
	<div>
		<nav class="navbar navbar-toggleable-md navbar-light bg-faded fixed-top d-none d-sm-none d-md-block d-lg-block d-xl-block navbar-expand-md navbar-expand-lg navbar-expand-xl">
			<div class="container">
				<router-link :to="{ name: 'discover' }" class="navbar-brand">
					<img :src="staticUrl('/images/bottle_square.png')" alt="CB" height="34" title="CodeBottle">
				</router-link>

				<form @submit.prevent="search">
					<input v-model="keywords" type="text" class="form-control" placeholder="Search">
				</form>

				<ul class="nav navbar-nav ml-3 mr-auto">
					<router-link :to="{ name: 'discover' }" tag="li" class="nav-item" exact>
						<a class="nav-link">Discover</a>
					</router-link>
					<router-link :to="{ name: 'create' }" tag="li" class="nav-item">
						<a class="nav-link">Create</a>
					</router-link>
				</ul>

				<!-- Unprotected links -->
				<ul v-if="!isAuthenticated" class="nav navbar-nav">
					<li class="nav-item">
						<router-link :to="{ name: 'signup' }" class="nav-link">Sign up</router-link>
					</li>
					<li class="nav-item">
						<router-link :to="{ name: 'signin' }" class="nav-link">Sign in</router-link>
					</li>
				</ul>

				<!-- Protected links -->
				<ul v-if="isAuthenticated" class="nav navbar-nav">
					<navbar-dropdown :label="'Hey ' + username + '!'" :options="userOptions" @on-select="onUserAction" />
				</ul>
			</div>
		</nav>

		<nav class="navbar navbar-toggleable-md navbar-light bg-faded fixed-top mobile-navbar d-block d-sm-block d-md-none d-lg-none d-xl-none">
			<div>
				<div class="row">
					<div class="col-auto">
						<a class="navbar-brand ml-3" href="javascript:undefined" @click="toggleMenu">
							<i class="fal fa-bars" aria-hidden="true" />
						</a>
					</div>
					<div class="col">
						<form @submit.prevent="search">
							<input v-model="keywords" type="text" class="form-control" placeholder="Search">
						</form>
					</div>
				</div>

				<div class="row nav">
					<router-link :to="{ name: 'discover' }" tag="div" class="nav-item col" exact>
						<a class="nav-link">Discover</a>
					</router-link>
					<router-link :to="{ name: 'create' }" tag="div" class="nav-item col">
						<a class="nav-link">Create</a>
					</router-link>
				</div>

				<!-- Unprotected links -->
				<div v-if="showMenu && !isAuthenticated" class="navbar-menu">
					<router-link :to="{ name: 'signup' }" class="nav-link">
						Sign up
					</router-link>
					<router-link :to="{ name: 'signin' }" class="nav-link">
						Sign in
					</router-link>
				</div>

				<!-- Protected links -->
				<ul v-if="showMenu && isAuthenticated" class="navbar-menu">
					<navbar-dropdown :label="'Hey ' + username + '!'"
						:options="userOptions"
						@on-select="onUserAction"
					/>
				</ul>
			</div>
		</nav>
	</div>
</template>

<script type="text/javascript">
	import { mapGetters, mapState } from 'vuex';
	import NavbarDropdown from './bootstrap/NavbarDropdown';
	import { staticUrl } from '../helpers';

	export default {
		components: {
			'navbar-dropdown': NavbarDropdown,
		},

		data() {
			return {
				showMenu: false,
				keywords: '',
			};
		},

		computed: {
			...mapGetters({
				isAuthenticated: 'auth/isAuthenticated',
			}),

			...mapState({
				username: state => state.users.self.username,
				admin: state => state.users.self.admin,
			}),

			userOptions() {
				return [
					{ label: 'View profile', key: 'view-profile' },
					{ label: 'Edit profile', key: 'edit-profile' },
					{ label: 'Settings', key: 'settings' },
					...(this.isAuthenticated && this.admin ? [{ label: 'Manage languages', key: 'manage-languages' }] : []),
					{ label: 'Sign out', key: 'sign-out' },
				];
			},
		},

		mounted: function() {
			this.$router.afterEach(() => {
				this.showMenu = false;
			});
		},

		methods: {
			toggleMenu: function() {
				this.showMenu = !this.showMenu;
			},

			search: function() {
				this.$router.push({ name: 'search', query: { q: this.keywords } });
				this.keywords = '';
			},

			onUserAction: function(item) {
				switch(item.key) {
				case 'view-profile':
					this.$router.push({ name: 'view-user', params: { username: this.username } });
					break;
				case 'edit-profile':
					this.$router.push({ name: 'edit-profile' });
					break;
				case 'settings':
					this.$router.push({ name: 'settings.preferences' });
					break;
				case 'manage-languages':
					this.$router.push({ name: 'languages' });
					break;
				case 'sign-out':
					this.$store.dispatch('auth/logout');
					if (this.$route.meta.requiresAuth)
						this.$router.push({ name: 'discover' });
					break;
				}
			},

			staticUrl,
		},
	};
</script>

<style lang="scss" scoped>
	.form-control {
		max-width: 380px;
	}

	form {
		margin-bottom: 0;
	}

	.active {
		font-weight: 700;
	}
</style>