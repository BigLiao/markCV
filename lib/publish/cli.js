const publish = require('./publish');
const path = require('path');

const distPath = path.join(process.cwd(), 'dist');

module.exports = function(value, cmd) {
  publish(distPath);
}
