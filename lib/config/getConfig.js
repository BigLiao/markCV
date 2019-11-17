const yaml = require('yaml');
const fs = require('fs-extra');
const path = require('path');
const { resolve } = require('../util/util');
const tempDir = resolve('.temp');


function formatConfig(config, configFilePath) {
  if (!config.resumePath) {
    throw new Error('\n配置文件错误：缺少 resumePath\n');
  }
  const formatedConfig = {
    title: config.title || 'markCV - Beautiful online resume',
    publicPath: config.publicPath || '/',
    showHeader: config.showHeader,
    headerInfo: config.headerInfo
  };
  if (config.showHeader) {
    formatedConfig.showHeader = true;
    formatedConfig.headerInfo = config.headerInfo;
    let photoUrl = config.headerInfo.photo;
    if (photoUrl && !/^(http)/.test(photoUrl)) {
      // 相对路径，要进行处理
      photoUrl = path.join(configFilePath, '..', photoUrl);
      photoUrl = path.relative(tempDir, photoUrl);
      formatedConfig.headerInfo.photo = photoUrl;
    }
  }
  formatedConfig.resumePath = path.join(configFilePath, '..', config.resumePath)
  return formatedConfig;
}

function getConfig (configFilePath) {
  if (!configFilePath) {
    const cwd = process.cwd();
    if (process.env.MARKCV_ENV === 'docker') {
      configFilePath = path.join(cwd, 'app/', '_config.yml');
    } else {
      configFilePath = path.join(cwd, '_config.yml');
    }
  }
  if (!fs.existsSync(configFilePath)) {
    throw new Error('\n配置文件不存在：' + configFilePath + '\n你可以通过命令 `node lib/init` 创建模板');
  }
  const configFile = fs.readFileSync(configFilePath, { encoding: 'utf8' });
  const config = yaml.parse(configFile);
  return formatConfig(config, configFilePath);
}

module.exports = getConfig;
