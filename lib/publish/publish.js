const ghpages = require( 'gh-pages' );

/**
 * 发布到 GitHub Pages
 * @param {string} distPath
 * @param {string} [repo] - Git repo URL
 */
function publish(distPath, repo) {
  ghpages.publish(distPath, {
    repo
  }, function ( err ) {
    if ( err ) {
      console.error( err );
    }
    console.log( 'Publish succeed!' );
  } );
}

module.exports = publish;
