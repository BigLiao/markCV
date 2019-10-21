
const webpack = require('webpack');
const getWebpackConfig = require('../config/webpackConfigDev');
const renderTemplate = require('../util/renderTemplate');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs-extra');
const getConfig = require('../config/getConfig');



function dev(mdPathAbs) {
  if (!fs.pathExistsSync(mdPathAbs)) {
    throw new Error(mdPathAbs + ' md文件不存在');
  }
  const config = getConfig();
  renderTemplate(mdPathAbs, {
    title: config.title
  });
  const webpackConfig = getWebpackConfig({
    publicPath: '/'
  });
  const compiler = webpack(webpackConfig);
  const devServerOptions = Object.assign({}, webpackConfig.devServer, {
    open: false,
    stats: {
      colors: true,
    },
  });
  const server = new WebpackDevServer(compiler, devServerOptions);
  server.listen(3000, '127.0.0.1', () => {
    console.log('Starting server on http://localhost:3000');
  });
}


module.exports = dev;
