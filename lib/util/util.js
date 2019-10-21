const fs = require('fs-extra');
const path = require('path');
const resolve = (...dir) => path.resolve(__dirname, '../..', ...dir);

exports.resolve = resolve;
