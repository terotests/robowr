

module.exports.run = function ( wr ) {
  wr.getFileWriter('/', 'moi.md')
    .out(`
# Moi

This is moi application.
Hello there world!!!
What else ? 
  `, true);

  wr.getFileWriter('/', 'README.md')
    // tag('modules')
    .out('- Added module moi.js')
  console.log('moi was run.')
}