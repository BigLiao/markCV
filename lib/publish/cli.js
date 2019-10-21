const publish = require('./publish');
const { resolve } = require('../util/util');

module.exports = function(value, cmd) {
  publish(resolve('dist'));
}
