<template>
	<div class="container">
		<div class="row" v-if="user.data" itemscope itemtype="http://schema.org/Person">
			<div class="col center-text">
				<img :src="user.data.profile_image" id="profile-img" class="center-block">
				<h1 id="username">
					<strong itemprop="additionalName">{{user.data.username}}</strong>
					<a @click.prevent="flag" href="javascript:undefined" id="flag-btn"><span class="fa fa-flag"></span></a>
				</h1>
				<p id="stats-bar">
					<span>
						<span class="fa fa-calendar fa-fw"></span>
						Joined {{moment(user.data.created_at).fromNow()}}
					</span> <br/>
					<span>
						<span class="fa fa-envelope fa-fw"></span>
						<span itemprop="email">{{user.data.email || 'Private email'}}</span>
					</span> <br/>
					<span v-if="user.data.github_username">
						<span class="fa fa-github fa-fw"></span>
						<a itemprop="email" class="nostyle" :href="'https://github.com/' + user.data.github_username">
							{{user.data.github_username}}
						</a>
					</span> <br/>
					<span v-if="user.data.banned">
						<span class="fa fa-exclamation-triangle fa-fw"></span>
						This user is banned
					</span> <br/>
				</p>
				<p id="bio" itemprop="description">
					{{user.data.bio}}
				</p>
				<modal :show="flagModalShown" title="Why are you flagging him?" :onDismiss="onFlagDismiss">
					<textarea class="form-control" id="flag-description" ref="flagDescription" placeholder="Explain briefly."></textarea>
					<button class="btn btn-primary" slot="footer" @click="submitFlag">Send</button>
				</modal>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {mapGetters} from 'vuex';
	import {apiUrl, getAbsoluteUrl, cookToast, extractError} from '../../helpers';
	import Modal from '../bootstrap/Modal';

	export default {
		data: () => ({
			user: {},
			flagModalShown: false,
		}),

		methods: {
			moment,

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
				})
			}
		},

		computed: {
			...mapGetters([
				'isAuthenticated',
				'preferences',
			]),
		},

		beforeRouteEnter: function(to, from, next) {
			axios.get(apiUrl('/users/' + to.params.username))
				.then(response => {
					next(vm => {
						vm.user = response.data;
					});
				}).catch(error => {
					next(false);
				});
		},

		updated: function() {
			this.$emit('updateHead');
		},

		head: {
			title: function() {
				return {
					inner: this.user.data ? "User " + this.user.data.username : "View user"
				};
			},

			meta: function() {
				return [
					{name: 'description', content: this.user.data ? this.user.data.bio || "No bio provided." : "No bio provided."},
					{property: 'og:description', content: this.user.data ? this.user.data.bio || "No bio provided." : "No bio provided."},
	                {property: 'og:title', content: this.user.data ? "User " + this.user.data.username : "View user"},
	                {property: 'og:url', content: getAbsoluteUrl(this.$route.path)},
				];
			},
		},

		components: {
			'modal': Modal,
		},
	}
</script>

<style type="text/css" scoped>
	#username {
		margin-top: 16px;
	}

	#bio {
		max-width: 520px;
		display: inline-block;
	}

	#profile-img {
		max-width: 320px;
		box-shadow: 0px 0px 2px 1px rgba(172,172,172,0.2);
		margin-top: 24px;
	}

	#flag-description {
		min-height: 10vh;
		width: 100%;
	}

	#flag-btn {
		color: #BC2C1A;
		font-size: 16px;
		vertical-align: super;
	}
</style>
