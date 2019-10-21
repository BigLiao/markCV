const markdownIt = require('markdown-it');
const path = require('path');
const fs = require('fs-extra');
const ejs = require('ejs');
const {resolve} = require('../util/util');
const tempDir = resolve('.temp');

const md = markdownIt();

function renderTemplate(mdPath) {
  const mdStr = fs.readFileSync(mdPath, { encoding: 'utf8' });
  const mdHtml = md.render(mdStr);
  const templateEjs = fs.readFileSync(resolve('views/index.ejs'), { encoding: 'utf8' })
  const templateHtml = ejs.render(templateEjs, {
    markdown: mdHtml
  });
  fs.ensureDirSync(tempDir);
  fs.writeFileSync(path.join(tempDir, 'template.html'), templateHtml);
}

module.exports = renderTemplate;
