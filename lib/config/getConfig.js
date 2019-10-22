const yaml = require('yaml');
const fs = require('fs-extra');
const path = require('path');
const { resolve } = require('../util/util');

function formatConfig(config, configFilePath) {
  if (!config.resumePath) {
    throw new Error('\n配置文件错误：缺少 resumePath\n');
  }
  const formatedConfig = {
    title: config.title || 'markCV - Beautiful online resume',
    publicPath: config.publicPath || '/'
  };
  formatedConfig.resumePath = path.join(configFilePath, '..', config.resumePath)
  return formatedConfig;
}

function getConfig (configFilePath) {
  if (!configFilePath) {
    const cwd = process.cwd();
    configFilePath = path.join(cwd, '_config.yml');
  }
  if (!fs.existsSync(configFilePath)) {
    throw new Error('\n配置文件不存在：' + configFilePath);
  }
  const configFile = fs.readFileSync(configFilePath, { encoding: 'utf8' });
  const config = yaml.parse(configFile);
  return formatConfig(config, configFilePath);
}

module.exports = getConfig;
