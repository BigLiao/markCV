const serve = require('./serve');
const path = require('path');
const distPath = path.join(process.cwd(), 'dist');

module.exports = function(value, cmd) {
  serve(distPath);
}
