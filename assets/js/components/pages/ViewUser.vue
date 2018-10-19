<template>
	<div class="container" v-if="user">
		<!-- Expanded (Desktop) -->
		<div class="expanded row d-none d-md-flex d-lg-flex d-xl-flex mt-1"
			itemscope itemtype="http://schema.org/Person">
			<div class="col-4">
				<img :src="user.profileImage" class="profile-img w-100">
			</div>
			<div class="col-8">
				<h1 class="mt-3">
					<strong itemprop="additionalName">{{user.username}}</strong>
					<a @click.prevent="flag" href="javascript:undefined" class="flag-btn"><span class="fas fa-flag" /></a>
				</h1>
				<p class="stats-bar">
					<span>
						<span class="far fa-calendar fa-fw" />
						Joined {{moment(user.createdAt).fromNow()}}
					</span> <br>
					<span>
						<span class="far fa-envelope fa-fw" />
						<span itemprop="email">{{user.email || 'Private email'}}</span>
					</span> <br>
					<span v-if="user.github_username">
						<span class="fab fa-github fa-fw" />
						<a itemprop="email" class="nostyle" :href="'https://github.com/' + user.github_username">
							{{user.github_username}}
						</a>
					</span> <br v-if="user.github_username">
					<span v-if="user.banned">
						<span class="far fa-exclamation-triangle fa-fw" />
						This user is banned
					</span> <br v-if="user.banned">
				</p>
				<p class="bio d-block" itemprop="description">
					{{user.bio}}
				</p>
			</div>
		</div>

		<!-- Collapsed (Mobile) -->
		<div class="collapsed row d-md-none d-lg-none d-xl-none">
			<div class="text-center mx-auto">
				<img :src="user.profileImage" class="profile-img mx-auto mt-3">
				<h1 class="mt-3">
					<strong>{{user.username}}</strong>
					<a @click.prevent="flag" href="javascript:undefined" class="flag-btn"><span class="fas fa-flag" /></a>
				</h1>
				<p class="stats-bar">
					<span>
						<span class="far fa-calendar fa-fw" />
						Joined {{moment(user.createdAt).fromNow()}}
					</span> <br>
					<span>
						<span class="far fa-envelope fa-fw" />
						<span>{{user.email || 'Private email'}}</span>
					</span> <br>
					<span v-if="user.github_username">
						<span class="fab fa-github fa-fw" />
						<a class="nostyle" :href="'https://github.com/' + user.github_username">
							{{user.github_username}}
						</a>
					</span> <br v-if="user.github_username">
					<span v-if="user.banned">
						<span class="far fa-exclamation-triangle fa-fw" />
						This user is banned
					</span> <br v-if="user.banned">
				</p>
				<p class="bio d-block">
					{{user.bio}}
				</p>
			</div>
		</div>

		<modal :show="flagModalShown" title="Why are you flagging them?" @on-dismiss="onFlagDismiss">
			<textarea class="form-control flag-description w-100" ref="flagDescription" placeholder="Explain briefly." />
			<button class="btn btn-primary" slot="footer" @click="submitFlag">Send</button>
		</modal>

		<snippets-deck class="mt-5" :snippets="user.snippets" v-if="user.snippets" />
	</div>
</template>

<script type="text/javascript">
	import {mapGetters} from 'vuex';
	import {apiUrl, getAbsoluteUrl, extractError} from '../../helpers';
	import Modal from '../bootstrap/Modal';
	import Loader from '../Loader';
	import SnippetsDeck from '../SnippetsDeck';

	export default {
		data: () => ({
			flagModalShown: false,
		}),

		methods: {
			flag: function() {
				if (!this.isAuthenticated)
					return this.$router.push({name: 'signin'});
				this.flagModalShown = true;
				setTimeout(() => { // I have no idea what else could I have done to focus it before it has rendered
					this.$refs.flagDescription.focus();
				}, 16);
			},

			onFlagDismiss: function() {
				this.flagModalShown = false;
			},

			submitFlag: function() {
				const description = this.$refs.flagDescription.value;
				this.flagModalShown = false;
				this.$store.dispatch('toasts/addToast', {
					content: 'Sending..',
					duration: 30000
				});

				axios.post(apiUrl('/users/' + this.$route.params.username + '/flag'), {
					description,
				}).then(response => {
					this.$store.dispatch('toasts/addToast', {
						content: 'Sent!',
						duration: 2000
					});
				}).catch(error => {
					this.$store.dispatch('toasts/addToast', {
						content: extractError(error),
						duration: 3000
					});
				});
			},

			moment: moment.utc
		},

		computed: {
			...mapGetters({
				isAuthenticated: 'auth/isAuthenticated',
				preferences: 'auth/preferences',
				userByUsername: 'users/getByUsername',
			}),

			user: function() {
				return this.userByUsername(this.$route.params.username);
			},
		},

		asyncData: function(store, route) {
			return store.dispatch('users/fetch', route.params.username).then(() => {
				return store.dispatch('users/fetchUserSnippets', route.params.username)
					.catch(e => {
						store.dispatch('toasts/addToast', {
							content: extractError(e),
							duration: 3000,
						});			
				});
			}).catch(e => {
				store.dispatch('toasts/addToast', {
					content: extractError(e),
					duration: 3000,
				});
			});
		},

		meta: function() {
			return {
				title: this.user ? 'User ' + this.user.username : 'View user',
				meta: [
					{name: 'description', content: this.user ? this.user.bio || 'No bio provided.' : 'No bio provided.'},
					{property: 'og:description', content: this.user ? this.user.bio || 'No bio provided.' : 'No bio provided.'},
					{property: 'og:title', content: this.user ? 'User ' + this.user.username : 'View user'},
					{property: 'og:image', content: this.user ? this.user.profileImage : '/images/bottle_square.png', vmid: 'image'},
					{property: 'og:url', content: getAbsoluteUrl(this.$route.path)},
				],
			};
		},

		components: {
			'modal': Modal,
			'loader': Loader,
			'snippets-deck': SnippetsDeck,
		},
	};
</script>

<style lang="scss" scoped>
	.bio {
		max-width: 520px;
	}

	.profile-img {
		box-shadow: 0px 0px 2px 1px rgba(172,172,172,0.2);
	}

	.collapsed .profile-img {
		max-width: 320px;
	}

	.flag-description {
		min-height: 10vh;
	}

	.flag-btn {
		color: #BC2C1A;
		font-size: 1rem;
		vertical-align: super;
	}
</style>
