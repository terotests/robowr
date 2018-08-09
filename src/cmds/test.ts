import { CodeWriter } from '../writer'

export function run( wr : CodeWriter ) {
  const readme = wr.getFileWriter('/', 'README.md')
    .out(`## Added by test`)

  const p = wr.findFile('/', 'package.json')

  const pData = JSON.parse(p.getCode())
  console.log('deps : ', pData.dependencies)

  readme.out(`
# Dependencies
${Object.keys(pData.dependencies).map( d => ` - ${d} `).join('\n')}  
  `)

}

export const short_doc = 'Test';

// the configuration...
export const init = {

}