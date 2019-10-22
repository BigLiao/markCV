const express = require('express');
const { resolve } = require('../util/util');
const getConfig = require('../config/getConfig');

function serve(distPath) {
  const config = getConfig();
  const publicPath = config.publicPath;
  const app = express();

  app.use(publicPath, express.static(distPath));

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}${publicPath}`);
  });
}

module.exports = serve;
