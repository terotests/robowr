

module.exports.run = function moi( wr ) {
  wr.getFileWriter('/', 'moi.md')
    .out(`
# Moi

This is moi application.
Does it work?
  `, true)
}