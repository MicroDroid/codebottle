require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackVersionPlugin = require('webpack-version-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const fs = require('fs');

const hljsLanguages = ['java', 'cpp', 'cs', 'python', 'php', 'javascript', 'perl', 'ruby', 'powershell', 'lua', 'json'];

module.exports = {
  entry: [
    './assets/scss/app.scss',
    './assets/js/app.js',
  ],
  output: {
    filename: 'js/app-[chunkhash].js',
    path: path.resolve(__dirname, 'public')
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
    extensions: ['.js', '.vue'],
  },
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
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        include: [/node_modules/, path.join(__dirname, 'assets/scss')],
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        }),
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpe?g|gif)$/,
        use: [
          'file-loader'
        ]
      },
    ],
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
        fs.writeFileSync(path.join(__dirname, './public/webpack-manifest.json'), JSON.stringify(manifest, null, 2));
      }
    }),

    new WebpackMd5Hash(),
  ],
};