

module.exports.run = function moi( wr ) {
  wr.getFileWriter('/', 'moi.md')
    .out(`
      moi moi moi moi !!!!!
  `, true)
}