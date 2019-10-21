
const webpack = require('webpack');

const webpackConfig = require('../config/webpackConfigProd');

const compiler = webpack(webpackConfig);
compiler.run();
