require('dotenv').config();

const os = require('os');

const config = require('./config');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const hljsLanguages = ['java', 'cpp', 'cs', 'css', 'python', 'php', 'javascript',
	'perl', 'ruby', 'powershell', 'lua', 'json', 'bash', 'less', 'markdown', 'scss',
	'sql', 'xml', 'yaml', 'crystal', 'dart', 'swift', 'typescript',
];

const isProd = process.env.NODE_ENV === 'production';

const common = {
	mode: isProd ? 'production' : 'development',
	module: {
		rules: [{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader'
				},
			},
			{
				test: /\.css$/,
				loaders: ['vue-style-loader', 'css-loader']
			},
			// For SCSS in Vue components
			{
				test: /\.scss$/,
				include: [path.join(__dirname, 'assets', 'js')],
				use: [
					'vue-style-loader',
					'css-loader',
					'sass-loader',
					{
						loader: 'sass-resources-loader',
						options: {
							resources: path.resolve(__dirname, 'assets/scss/_variables.scss'),
						},
					},
				],
			},
			// For other SCSS files
			{
				test: /\.scss$/,
				include: [/node_modules/, path.join(__dirname, 'assets', 'scss')],
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
				use: [
					'file-loader?name=fonts/[name].[ext]'
				]
			},
			{
				test: /\.md$/,
				use: {
					loader: 'raw-loader',
					options: {
						esModule: false,
					},
				},
			}
		],
	},

	resolve: {
		alias: {
			vue$: 'vue/dist/vue.esm.js',
		},
		extensions: ['.js', '.vue'],
	}
};

module.exports = [{
		entry: [
			path.join(__dirname, 'assets', 'js', 'entry-client.js'),
			path.join(__dirname, 'assets', 'scss', 'app.scss'),
		],
		output: {
			filename: 'js/app-[chunkhash].js',
			path: path.resolve(__dirname, 'public'),
			publicPath: '/',
		},
		plugins: [
			new VueLoaderPlugin(),
			new MiniCssExtractPlugin({
				filename: 'css/app-[contenthash].css'
			}),

			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: `'${process.env.NODE_ENV}'`,
					OAUTH_GITHUB_CLIENT_ID: `'${config.oauth.github.clientId}'`,
					OAUTH_GITHUB_REDIRECT_URI: `'${config.oauth.github.redirectUri}'`,
				}
			}),

			new webpack.ContextReplacementPlugin(
				/highlight\.js\/lib\/languages$/,
				new RegExp(`^./(${hljsLanguages.join('|')})$`)
			),

			new HtmlWebpackPlugin({
				template: path.join(__dirname, 'assets', 'index-template.html'),
				minify: {
					collapseWhitespace: false, // https://github.com/nuxt/nuxt.js/issues/1552#issuecomment-341729165
					preserveLineBreaks: false
				},
				filename: path.join(__dirname, 'build', 'index.html'),
			}),
		],


		...isProd ? {
			optimization: {
				minimizer: [
					new TerserWebpackPlugin({
						cache: true,
						parallel: os.cpus().length,
						sourceMap: false,
					}),
					new OptimizeCssAssetsPlugin(),
				]
			}
		} : {},

		...common
	},

	{
		target: 'node',
		entry: [
			path.join(__dirname, 'assets', 'js', 'entry-server.js'),
		],
		output: {
			filename: 'js/ssr.js',
			path: path.resolve(__dirname, 'build'),
			libraryTarget: 'commonjs2',
		},
		plugins: [
			new VueLoaderPlugin(),
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: `'${process.env.NODE_ENV}'`,
					OAUTH_GITHUB_CLIENT_ID: `'${config.oauth.github.clientId}'`,
					OAUTH_GITHUB_REDIRECT_URI: `'${config.oauth.github.redirectUri}'`,
				},
				'process.env.VUE_ENV': '"server"'
			}),

			new webpack.ContextReplacementPlugin(
				/highlight\.js\/lib\/languages$/,
				new RegExp(`^./(${hljsLanguages.join('|')})$`)
			),

			new VueSSRServerPlugin(),
		],

		...common
	},
];