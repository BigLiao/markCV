
const webpack = require('webpack');
const getWebpackConfig = require('../config/webpackConfigProd');
const renderTemplate = require('../util/renderTemplate');
const path = require('path');
const fs = require('fs-extra');
const getConfig = require('../config/getConfig');


function build() {
  const config = getConfig();
  const mdPathAbs = config.resumePath;
  if (!fs.pathExistsSync(mdPathAbs)) {
    throw new Error(mdPathAbs + ' md文件不存在');
  }
  renderTemplate(mdPathAbs, {
    ...config
  }, false);
  const webpackConfig = getWebpackConfig({
    publicPath: config.publicPath
  });
  const compiler = webpack(webpackConfig);
  compiler.run((err, stats) => {
    if (err) {
      throw err;
    }
    console.log('Building succeed!');
  });
}


module.exports = build;
