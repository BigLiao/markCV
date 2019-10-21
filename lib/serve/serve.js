const express = require('express');
const { resolve } = require('../util/util');
const getConfig = require('../config/getConfig');

function serve() {
  const config = getConfig();

  const app = express();

  app.use(express.static(resolve('dist')));

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = serve;
