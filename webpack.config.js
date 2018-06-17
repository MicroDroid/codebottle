require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackVersionPlugin = require('webpack-version-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const fs = require('fs');

const hljsLanguages = ['java', 'cpp', 'cs', 'css', 'python', 'php', 'javascript',
                        'perl', 'ruby', 'powershell', 'lua', 'json', 'bash', 'less',
                        'markdown', 'scss', 'sql', 'html', 'xml', 'yaml'];

const isProd = process.env.NODE_ENV === 'production';

const common = {
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader',
    },
    {
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      },
    },
    {
      test: /\.css$/,
      loaders: ['vue-style-loader', 'css-loader']
    },
    {
      test: /\.scss$/,
      include: [/node_modules/, path.join(__dirname, 'assets/scss')],
      loader: ExtractTextPlugin.extract({
        fallback: 'vue-style-loader',
        use: ['css-loader', 'sass-loader']
      }),
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
      use: [
        'file-loader?name=/fonts/[name].[ext]'
      ]
    }],
  },

  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
    extensions: ['.js', '.vue'],
  }
};

module.exports = [
  {
    entry: [
      './assets/scss/app.scss',
      './assets/js/entry-client.js',
    ],
    output: {
      filename: 'js/app-[chunkhash].js',
      // chunkFilename: 'js/[name].[id].[chunkhash:5].js',
      path: path.resolve(__dirname, 'public')
    },
    plugins: [
      new ExtractTextPlugin('css/app-[contenthash].css'),

      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: `'${process.env.NODE_ENV}'`
        }
      }),

      new webpack.ContextReplacementPlugin(
        /highlight\.js\/lib\/languages$/,
        new RegExp(`^./(${hljsLanguages.join('|')})$`)
      ),

      new WebpackVersionPlugin({
        cb: (manifest) => {
          manifest = {
            js: manifest.files.main.filter(f => f.endsWith('.js'))[0],
            css: manifest.files.main.filter(f => f.endsWith('.css'))[0],
          }
          fs.writeFileSync(path.join(__dirname, 'build', 'webpack-manifest.json'), JSON.stringify(manifest, null, 2));
        }
      }),

      new WebpackMd5Hash(),

      ...(isProd ? [
      	new UglifyJsPlugin(),
        new OptimizeCssAssetsPlugin(),
      ] : []),
    ],

    ...common
  },

  {
    target: 'node',
    entry: [
      './assets/js/entry-server.js',
    ],
    output: {
      filename: 'js/ssr.js',
      path: path.resolve(__dirname, 'build'),
      // chunkFilename: '[name].[id].[chunkhash:5].js',
      libraryTarget: 'commonjs2',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: `'${process.env.NODE_ENV}'`
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