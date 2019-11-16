const path = require('path');
const fs = require('fs-extra');
const { resolve } = require('../util/util');

const isInDocker = process.env.MARKCV_ENV === 'docker';


function init() {
  const cwd = process.cwd();
  const configPath = path.join(cwd, '_config.yml');
  if (fs.existsSync(configPath)) {
    throw new Error('配置文件已存在\n_config.yml exists!');
  }

  const distPath = isInDocker ? path.join(cwd, 'app') : cwd;

  const mdSrcPath = resolve('markdown/resume-template.md');
  const mdDistPath = path.join(distPath, 'markdown/resume-template.md');
  const configSrcPath = resolve('_config.yml');
  const configDistPath = path.join(distPath, '_config.yml');
  fs.copySync(mdSrcPath, mdDistPath);
  fs.copySync(configSrcPath, configDistPath);
  console.log('初始化成功！\n 执行 markcv write 预览和编辑简历');
}

module.exports = init;
