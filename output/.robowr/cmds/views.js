
module.exports.run = function ( wr ) {
  console.log('Views called ')
  const model = wr.getState()
  const viewsFile = wr.getFileWriter('/src/views/', 'index.ts');

  viewsFile.out('', true)
  model.entities.forEach( entity => {
    viewsFile.out(`// view for model ${entity.name}`, true)
  })
}