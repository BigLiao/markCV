#!/usr/bin/env node

const pkg = require('../package.json');
const program = require('commander');

program
  .version(pkg.version)
  .usage('<markdown_file>')

program
  .command('write')
  .description('Generate resume site')
  .action((value, cmd) => {
    require('../lib/dev/cli')(value, cmd);
  });

program
  .command('build')
  .description('Generate resume site')
  .action((value, cmd) => {
    require('../lib/build/cli')(value, cmd);
  });

program
  .command('publish')
  .description('Publish website')
  .action((value, cmd) => {
    require('../lib/publish/cli')(value, cmd);
  });

program
  .command('serve')
  .description('Run web server locally')
  .action((value, cmd) => {
    require('../lib/serve/cli')(value, cmd);
  });



program.parse(process.argv);
