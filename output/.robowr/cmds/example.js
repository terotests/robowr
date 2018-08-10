module.exports.run = function ( wr ) {
  const state = wr.getState()
  wr.getFileWriter('/', `helloworld.js`)
    .out(`console.log("${state.hello}");`, true)
}