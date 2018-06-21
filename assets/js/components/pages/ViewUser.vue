<template>
	<div class="container" v-if="user">
		<!-- Expanded (Desktop) -->
		<div class="expanded row d-none d-md-flex d-lg-flex d-xl-flex mt-1"
			itemscope itemtype="http://schema.org/Person">
			<div class="col-4">
				<img :src="user.profileImage" class="profile-img">
			</div>
			<div class="col-8">
				<h1 class="username">
					<strong itemprop="additionalName">{{user.username}}</strong>
					<a @click.prevent="flag" href="javascript:undefined" class="flag-btn"><span class="fas fa-flag"></span></a>
				</h1>
				<p class="stats-bar">
					<span>
						<span class="far fa-calendar fa-fw"></span>
						Joined {{moment(user.createdAt).fromNow()}}
					</span> <br/>
					<span>
						<span class="far fa-envelope fa-fw"></span>
						<span itemprop="email">{{user.email || 'Private email'}}</span>
					</span> <br/>
					<span v-if="user.github_username">
						<span class="fab fa-github fa-fw"></span>
						<a itemprop="email" class="nostyle" :href="'https://github.com/' + user.github_username">
							{{user.github_username}}
						</a>
					</span> <br v-if="user.github_username"/>
					<span v-if="user.banned">
						<span class="far fa-exclamation-triangle fa-fw"></span>
						This user is banned
					</span> <br v-if="user.banned"/>
				</p>
				<p class="bio" itemprop="description">
					{{user.bio}}
				</p>
			</div>
		</div>

		<!-- Collapsed (Mobile) -->
		<div class="collapsed row d-md-none d-lg-none d-xl-none">
			<div class="center-text">
				<img :src="user.profileImage" class="profile-img center-block">
				<h1 class="username">
					<strong>{{user.username}}</strong>
					<a @click.prevent="flag" href="javascript:undefined" class="flag-btn"><span class="fas fa-flag"></span></a>
				</h1>
				<p class="stats-bar">
					<span>
						<span class="far fa-calendar fa-fw"></span>
						Joined {{moment(user.createdAt).fromNow()}}
					</span> <br/>
					<span>
						<span class="far fa-envelope fa-fw"></span>
						<span>{{user.email || 'Private email'}}</span>
					</span> <br/>
					<span v-if="user.github_username">
						<span class="fab fa-github fa-fw"></span>
						<a class="nostyle" :href="'https://github.com/' + user.github_username">
							{{user.github_username}}
						</a>
					</span> <br v-if="user.github_username"/>
					<span v-if="user.banned">
						<span class="far fa-exclamation-triangle fa-fw"></span>
						This user is banned
					</span> <br v-if="user.banned"/>
				</p>
				<p class="bio">
					{{user.bio}}
				</p>
			</div>
		</div>

		<modal :show="flagModalShown" title="Why are you flagging them?" @on-dismiss="onFlagDismiss">
			<textarea class="form-control flag-description" ref="flagDescription" placeholder="Explain briefly."></textarea>
			<button class="btn btn-primary" slot="footer" @click="submitFlag">Send</button>
		</modal>

		<snippets-deck id="snippets-deck" :snippets="user.snippets" v-if="user.snippets"></snippets-deck>
	</div>
</template>

<script type="text/javascript">
	import {mapGetters} from 'vuex';
	import {apiUrl, getAbsoluteUrl, cookToast, extractError} from '../../helpers';
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
				cookToast('Sending..', 30000);

				axios.post(apiUrl('/users/' + this.$route.params.username + '/flag'), {
					description,
				}).then(response => {
					cookToast('Sent!', 2000);
				}).catch(error => {
					cookToast(extractError(error), 3000);
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
						cookToast(extractError(e), 3000);			
				});
			}).catch(e => {
				cookToast(extractError(e), 3000);
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

<style type="text/css" scoped>
	.username {
		margin-top: 16px;
	}

	.bio {
		max-width: 520px;
		display: inline-block;
	}

	.profile-img {
		box-shadow: 0px 0px 2px 1px rgba(172,172,172,0.2);
	}

	.expanded .profile-img {
		width: 100%;
	}

	.collapsed .profile-img {
		max-width: 320px;
		margin-top: 24px;
	}

	.flag-description {
		min-height: 10vh;
		width: 100%;
	}

	.flag-btn {
		color: #BC2C1A;
		font-size: 16px;
		vertical-align: super;
	}

	#snippets-deck {
		margin-top: 72px;
	}
</style>
