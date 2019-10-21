const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseWebpackConfig = require('./webpackConfigBase');
const { resolve } = require('../util/util');

const webpackConfig = {
  mode: 'development',
  entry: resolve('views/index.js'),
  output: {
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        use: 'ejs-loader'
      },
      {
        test: /\.md$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
      new HtmlWebpackPlugin({
          template: resolve('views/index.ejs'),
      }),
      new webpack.HotModuleReplacementPlugin(),
  ]
}

module.exports = merge(baseWebpackConfig, webpackConfig);
