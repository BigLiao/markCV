import './style.scss';
const markdownIt = require('markdown-it');
const resume = require('../markdown/resume.md');

const mdt = markdownIt();
const result = mdt.render(resume.default);

document.getElementById('markdown-body').innerHTML = result;
