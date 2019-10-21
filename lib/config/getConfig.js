const yaml = require('yaml');
const fs = require('fs-extra');
const { resolve } = require('../util/util');

function getConfig (configFilePath) {
  if (!configFilePath) {
    configFilePath = resolve('_config.yml');
  }
  const configFile = fs.readFileSync(configFilePath, { encoding: 'utf8' });
  const config = yaml.parse(configFile);
  return config;
}

module.exports = getConfig;
