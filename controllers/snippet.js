const Sequelize = require('sequelize');
const models = require('../models');
const ApiError = require('../errors/api-error');
const redis = require('../redis');
const crypto = require('crypto');

const controller = {
	index: async (ctx, next) => {
		if (ctx.query.keywords || ctx.query.language) {
			return controller.search(ctx, next);
		} else return controller.getNew(ctx, next);
	},

	get: async (ctx, next) => {
		const snippet = await models.snippet.findOne({
			where: {
				public_id: ctx.params.id
			},
			include: [
				models.language,
				models.category,
				models.vote,
				models.user,
				models.snippetRevision,
				models.tag,
			],
		});

		if (!snippet)
			throw new ApiError(404, 'Not found');

		const cacheKey = `snippets:${snippet.id}:view.throttle:${ctx.ip}`;

		if (!(await redis.getAsync(cacheKey))) {
			snippet.increment('views', {
				silent: true
			});
			snippet.views++; // It doesn't get automatically updated when incrementing
			await redis.setAsync(cacheKey, 1, 'EX', 3600 * 4);
		}

		let currentVote;

		if (ctx.state.user) {
			currentVote = await ctx.state.user.getVotes({
				where: {
					'snippet_id': snippet.id
				}
			});

			currentVote = currentVote[0] ? currentVote[0].vote : 0;
		}

		ctx.body = models.snippet.transform(snippet, currentVote);

		return next();
	},

	async setTags(ctx, next) {
		const snippet = await models.snippet.findOne({
			where: {
				public_id: ctx.params.id
			},
			include: [
				models.tag,
			],
		});

		const tagIds = Array.isArray(ctx.request.body.tags) ?
			ctx.request.body.tags : [ctx.request.body.tags];

		if (!snippet)
			throw new ApiError(404, 'Not found');

		if (ctx.state.user.id !== snippet.user_id)
			throw new ApiError(403, 'Access denied');

		if (!tagIds)
			throw new ApiError(422, 'Tags field is required');

		const tags = await models.tag.findAll({
			where: {
				id: {
					[Sequelize.Op.in]: tagIds
				},
			},
		});

		// Missing tags?
		if (tags.length !== tagIds.length)
			throw new ApiError(422, 'Invalid tags');

		snippet.setTags(tags);

		ctx.status = 204;
	},

	edit: async (ctx, next) => {
		const snippet = await models.snippet.findOne({
			where: {
				'public_id': ctx.params.id
			},
			include: [
				models.user,
				models.language,
				models.category,
				models.snippetRevision,
				models.vote,
				models.tag,
			],
		});

		if (!snippet)
			throw new ApiError(404, 'Not found');
		if (!ctx.state.user.admin && ctx.state.user.id !== snippet.user.id)
			throw new ApiError(403, 'You can only edit your snippets');

		const title = ctx.request.body.title;
		const code = ctx.request.body.code;
		const description = ctx.request.body.description;
		const explanation = ctx.request.body.explanation;

		if (!title)
			throw new ApiError(422, 'Title field is required');
		else if (title.length < 20)
			throw new ApiError(422, 'Title is too short');
		else if (title.length > 70)
			throw new ApiError(422, 'Title is too long');
		else if (!code)
			throw new ApiError(422, 'Code field is required');

		const language = await models.language.findOne({
			where: {
				id: ctx.request.body.language
			},
		});

		const category = await models.category.findOne({
			where: {
				id: ctx.request.body.category
			},
		});

		if (!language)
			throw new ApiError(422, 'Invalid language selected');
		else if (!category)
			throw new ApiError(422, 'Invalid category selected');

		if (title != snippet.title ||
			code != snippet.code ||
			description != snippet.description ||
			ctx.request.body.language != snippet.language_id ||
			ctx.request.body.category != snippet.category_id) {
			await snippet.update({
				title,
				code,
				description,
				language_id: language.id,
				category_id: category.id,
			});

			await models.snippetRevision.create({
				title,
				code,
				description,
				explanation,
				snippet_id: snippet.id,
				user_id: ctx.state.user.id,
				language_id: language.id,
				category_id: category.id,
			});

			await snippet.reload({
				include: [models.user, models.language, models.category, models.snippetRevision, models.vote]
			});
		}

		ctx.body = models.snippet.transform(snippet, 0);

		return next();
	},

	search: async (ctx, next) => {
		if (typeof (ctx.query.keywords) !== 'string' || !ctx.query.keywords)
			throw new ApiError(422, 'Missing keywords');

		if (ctx.query.keywords.length < 3)
			throw new ApiError(422, 'Keywords too short');

		if (ctx.query.language) {
			const language = await models.language.findOne({
				where: {
					id: ctx.query.language
				}
			});
			if (!language)
				throw new ApiError(422, 'Invalid language');
		}

		let where = {
			[Sequelize.Op.or]: [{
					title: {
						[Sequelize.Op.like]: '%' + ctx.query.keywords + '%'
					}
				},
				{
					description: {
						[Sequelize.Op.like]: '%' + ctx.query.keywords + '%'
					}
				},
			],
		};

		if (ctx.query.language)
			where.language_id = ctx.query.language;

		const snippets = await models.snippet.findAll({
			where,
			limit: 10,
			include: [
				models.language,
				models.category,
				models.vote,
				models.user,
				models.tag,
			],
		});

		ctx.body = snippets.map(s => models.snippet.transform(s));

		return next();
	},

	getNew: async (ctx, next) => {
		const snippets = await models.snippet.findAll({
			limit: 30,
			order: [
				['created_at', 'DESC'],
			],
			include: [
				models.language,
				models.category,
				models.vote,
				models.user,
				models.tag,
			],
		});

		ctx.body = snippets.map(s => models.snippet.transform(s));

		return next();
	},

	create: async (ctx, next) => {
		const title = ctx.request.body.title;
		const code = ctx.request.body.code;
		const description = ctx.request.body.description;

		if (!title)
			throw new ApiError(422, 'Title field is required');
		else if (title.length < 20)
			throw new ApiError(422, 'Title is too short');
		else if (title.length > 70)
			throw new ApiError(422, 'Title is too long');
		else if (!code)
			throw new ApiError(422, 'Code field is required');

		const language = await models.language.findOne({
			where: {
				id: ctx.request.body.language
			},
		});

		const category = await models.category.findOne({
			where: {
				id: ctx.request.body.category
			},
		});

		if (!language)
			throw new ApiError(422, 'Invalid language selected');
		else if (!category)
			throw new ApiError(422, 'Invalid category selected');

		const snippet = await models.snippet.create({
			user_id: ctx.state.user.id,
			public_id: await crypto.randomBytes(5).toString('hex'),
			title,
			code,
			description,
			language_id: language.id,
			category_id: category.id,
		});

		await snippet.reload({
			include: [
				models.language,
				models.category,
				models.vote,
				models.snippetRevision,
				models.tag,
			],
		});

		ctx.body = models.snippet.transform(snippet, 0);

		return next();
	},

	delete: async (ctx, next) => {
		const snippet = await models.snippet.findOne({
			where: {
				'public_id': ctx.params.id
			},
			include: [
				models.language,
				models.category,
				models.vote,
				models.user,
				models.tag,
			],
		});

		if (!snippet)
			throw new ApiError(404, 'Not found');

		if (!ctx.state.user.admin && ctx.state.user.id !== snippet.user.id)
			throw new ApiError(403, 'You can only delete your snippets');

		snippet.destroy();

		ctx.status = 204;

		return next();
	},
};

module.exports = controller;