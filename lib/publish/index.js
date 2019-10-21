const publish = require('./publish');
const { resolve } = require('../util/util');


publish(resolve('dist'));
