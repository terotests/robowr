

module.exports.run = function moi( wr ) {
  wr.getFileWriter('/', 'moi.md')
    .out(`
# Moi

This is moi application.
Hello there world!!!
  `, true);

  wr.getFileWriter('/', 'README.md')
    .tag('modules')
    .out('- Added module moi.js')
}