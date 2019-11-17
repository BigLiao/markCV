const markdownIt = require('markdown-it');
const path = require('path');
const fs = require('fs-extra');
const ejs = require('ejs');
const {resolve} = require('../util/util');
const tempDir = resolve('.temp');

const md = markdownIt();

function renderTemplate(mdPath, options, watchMode = true) {
  const ejsPath = resolve('views/index.ejs');
  function render() {
    const mdStr = fs.readFileSync(mdPath, { encoding: 'utf8' });
    const mdHtml = md.render(mdStr);
    const templateEjs = fs.readFileSync(ejsPath, { encoding: 'utf8' })
    const templateHtml = ejs.render(templateEjs, {
      markdown: mdHtml,
      title: options.title || '',
      headerInfo: options.headerInfo,
      showHeader: options.showHeader
    });
    fs.ensureDirSync(tempDir);
    fs.writeFileSync(path.join(tempDir, 'template.html'), templateHtml);
  }
  render();
  if (watchMode) {
    fs.watchFile(mdPath, () => {
      console.log('markdown changed');
      render();
    });
    fs.watchFile(ejsPath, () => {
      console.log('ejs changed');
      render();
    });
  }
}

module.exports = renderTemplate;
