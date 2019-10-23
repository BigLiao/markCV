const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseWebpackConfig = require('./webpackConfigBase');
const { resolve } = require('../util/util');

function getWebpackConfig({ publicPath = '/' }) {
  const webpackConfig = {
    mode: 'development',
    entry: {
      main: resolve('views/index.js'),
    },
    output: {
      filename: 'assets/js/[name].js',
      chunkFilename: 'assets/js/[name].bundle.js',
      publicPath: publicPath
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
        new MiniCssExtractPlugin({
          filename: 'assets/css/[name].css',
          chunkFilename: 'assets/css/[id].css',
        })
    ]
  }
return merge(baseWebpackConfig, webpackConfig);
}

module.exports = getWebpackConfig;
