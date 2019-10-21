
const webpack = require('webpack');
const getWebpackConfig = require('../config/webpackConfigProd');
const renderTemplate = require('../util/renderTemplate');
const path = require('path');
const fs = require('fs-extra');
const getConfig = require('../config/getConfig');


function build(mdPathAbs) {
  if (!fs.pathExistsSync(mdPathAbs)) {
    throw new Error(mdPathAbs + ' md文件不存在');
  }
  const config = getConfig();
  renderTemplate(mdPathAbs, {
    title: config.title
  });
  const webpackConfig = getWebpackConfig({
    publicPath: config.publicPath
  });
  const compiler = webpack(webpackConfig);
  compiler.run();
}


module.exports = build;
