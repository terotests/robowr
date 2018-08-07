

module.exports.moi = function moi( wr ) {
  wr.getFileWriter('/', 'moi.md')
    .out(`
      moi moi  
  `, true)
}