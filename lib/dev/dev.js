
const webpack = require('webpack');
const getWebpackConfig = require('../config/webpackConfigDev');
const renderTemplate = require('../util/renderTemplate');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs-extra');
const getConfig = require('../config/getConfig');



function dev() {
  const config = getConfig();
  const mdPathAbs = config.resumePath;
  if (!fs.pathExistsSync(mdPathAbs)) {
    throw new Error(mdPathAbs + ' md文件不存在');
  }
  renderTemplate(mdPathAbs, {
    ...config
  });
  const webpackConfig = getWebpackConfig({
    publicPath: '/'
  });
  const compiler = webpack(webpackConfig);
  const devServerOptions = Object.assign({}, webpackConfig.devServer, {
    open: false,
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: false,
      assets: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      errors: false,
      errorDetails: false,
      warnings: false,
      publicPath: false
    }
  });
  const server = new WebpackDevServer(compiler, devServerOptions);
  server.listen(3000, '0.0.0.0', () => {
    console.log('Starting server on http://0.0.0.0:3000');
  });
}


module.exports = dev;
