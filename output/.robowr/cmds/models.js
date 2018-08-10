

// create base models for the application...
module.exports.run = function ( wr ) {
  const model = wr.getState()
  model.entities.forEach( entity => {
    const m = wr.getFileWriter('/src/model/', `${entity.name}.ts`)
    m.out('// Model definition for ' + entity.name, true)

    // create base model for each entry
    m.out(`export class Model${entity.name} {`, true)
    m.indent(1)
      entity.fields.forEach( field => {
        m.out(`${field.name} : ${field.type}`, true)
      })
    m.indent(-1)
    m.out(`}`, true)

  })
}