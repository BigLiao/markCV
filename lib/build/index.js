const { resolve } = require('../util/util');
const build = require('./build');

build(resolve('markdown/resume.md'))
