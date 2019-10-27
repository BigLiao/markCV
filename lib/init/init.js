const path = require('path');
const fs = require('fs-extra');
const { resolve } = require('../util/util');

function init() {
  const cwd = process.cwd();
  const configPath = path.join(cwd, '_config.yml');
  if (fs.existsSync(configPath)) {
    throw new Error('配置文件已存在\n_config.yml exists!');
  }
  const mdSrcPath = resolve('markdown/resume-template.md');
  const mdDistPath = path.join(cwd, 'markdown/resume-template.md');
  const configSrcPath = resolve('_config.yml');
  const configDistPath = path.join(cwd, '_config.yml');
  fs.copySync(mdSrcPath, mdDistPath);
  fs.copySync(configSrcPath, configDistPath);
  console.log('初始化成功！\n 执行 markcv write 预览和编辑简历');
}

module.exports = init;
