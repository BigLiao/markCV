const serve = require('./serve');
const { resolve } = require('../util/util');

serve(resolve('dist'));
