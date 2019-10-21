const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

const webpackConfig = require('../config/webpackConfigDev');

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
