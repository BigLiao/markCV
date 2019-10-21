const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseWebpackConfig = require('./webpackConfigBase');
const { resolve } = require('../util/util');

const webpackConfig = {
  mode: 'development',
  entry: {
    markdown: resolve('markdown/resume.md'),
    main: resolve('views/index.js'),
  },
  output: {
    filename: 'assets/js/[name].js',
    chunkFilename: 'assets/js/[name].bundle.js',
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
      new webpack.HotModuleReplacementPlugin(),
      // new MiniCssExtractPlugin({
      //   filename: 'assets/css/[name].css',
      //   chunkFilename: 'assets/css/[id].css',
      // })
  ]
}

module.exports = merge(baseWebpackConfig, webpackConfig);
