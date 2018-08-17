exports.order = 1000
module.exports.run = function(wr) {
  console.log('Last command')

  const git = require('simple-git')
  console.log(git)
}