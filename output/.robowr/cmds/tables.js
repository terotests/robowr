

// create base models for the application...
module.exports.run = function ( wr ) {

  const model = wr.getState()
  model.tables.table.forEach( table => {
    const name = table['-name'];
    const fields = table.field;
    const m = wr.getFileWriter('/src/sql/', `${name}.sql`)
    m.out('# SQL statements for the ' + name, true)

    m.out('CREATE TABLE '+name+' (', true)
    m.indent(1)
      fields.forEach( f => {
        m.out(`${f['-name']} `)
        switch( f['-type']) {
          case "int_primary":
            m.out(' int not null PRIMARY KEY')
            break;
          case "int_utc_created":
            m.out(' int')
            break;
          case "int":
          case "int_userid":
            m.out(' int')
            break;
          case "varchar":
            m.out(' varchar(255)')
            break;            
          case "text":
            m.out(' text ')
            break;            
        }
        m.out(',', true)
      })
/*
        "field": [
          {
            "-name": "id",
            "-title": "Primary key",
            "-type": "int_primary",
            "-searchable": "1"
          },
*/    
    

    m.indent(-1)
    m.out(')', true)

  })
  
}