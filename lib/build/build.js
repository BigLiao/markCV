
const webpack = require('webpack');
const webpackConfig = require('../config/webpackConfigProd');
const renderTemplate = require('../util/renderTemplate');
const path = require('path');
const fs = require('fs-extra');



function build(mdPathAbs) {
  if (!fs.pathExistsSync(mdPathAbs)) {
    throw new Error(mdPathAbs + ' md文件不存在');
  }
  renderTemplate(mdPathAbs);
  const compiler = webpack(webpackConfig);
  compiler.run();
}


module.exports = build;
