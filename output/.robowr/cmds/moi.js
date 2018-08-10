

module.exports.run = function ( wr ) {
  wr.getFileWriter('/', 'moi.md')
    .out(`
# Moi

This is moi application.
Hello there world!!!
What else ? 
  `, true);

  const readme = wr.getFileWriter('/', 'README.md')
  readme.out('## added module moi.js', true)
    // tag('modules')
  //   .out('- Added module moi.js')
  console.log('moi was run!!!')
}