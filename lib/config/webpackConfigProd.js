const merge = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseWebpackConfig = require('./webpackConfigBase');
const { resolve } = require('../util/util');

const webpackConfig = {
  mode: 'development',
  entry: {
    main: resolve('views/index.js'),
  },
  output: {
    filename: 'assets/js/[name].[contenthash:8].js',
    publicPath: '/'
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
          template: resolve('.temp/template.html'),
      }),
      // new MiniCssExtractPlugin({
      //   filename: 'assets/css/[name].[contenthash:8].css',
      //   chunkFilename: 'assets/css/[id].[contenthash:8].css',
      // })
  ]
}

module.exports = merge(baseWebpackConfig, webpackConfig);
