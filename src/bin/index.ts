#!/usr/bin/env node

import {CodeWriter, CodeFileSystem} from '../writer/'

const argv = require('minimist')(process.argv.slice(2));
var readlineSync = require('readline-sync');
 
const rootPath = process.env.ROBOWR || process.cwd() + '/.robowr/';
const fs = require('fs')

console.log(argv);

const commands = []

fs.readdirSync(rootPath).forEach(file => {
  const name = file.split('.')[0]
  const ext = file.split('.')[1]
  if(ext === 'js') {
    try {
      const cmd = require(rootPath + '/' + file)
      commands.push( {
        name,
        short_doc : cmd.short_doc || '',
        long_doc : cmd.long_doc || '',
        init : cmd.init || {}
      })
    } catch(e) {

    }
  }
}) 

if(argv._.length < 1) {
  console.log('robowr <command>')
  const spaces = (s:string, len:number) : string => {
    let res = s
    let i = len - s.length
    while(i-- > 0 ) res = res + ' '
    return res
  }
  commands.forEach( cmd => {
    console.log('  ', spaces(cmd.name,15), cmd.short_doc || '')
  })
  process.exit()
}

// console.log(argv._)

// TODO: can you undo the ROBOWR operatorions ? 
// writing a lot of files can be a bit dangerous sometimes...

const outputDir = argv.o || argv.output || './robo_output/'

if(!outputDir) {
  console.log('robowr <commands> --o <outputdir>')
  console.log('Please give the output directory')
  process.exit()
}

// console.log(fs.readFileSync('/dev/stdin').toString());
let initData = {}

const readCommandData = ( CmdName : string ) : any => {
  try {
    console.log(process.cwd() + '/' + CmdName + '.json')
    const TryData = fs.readFileSync( process.cwd() + '/' + CmdName + '.json', 'utf8' )
    const TryObj = JSON.parse(TryData)
    return TryObj;
  } catch(e) {

  }  
  return {}
}

// Initialize the command data
for( let CmdName of argv._) {

  initData = { ...initData, ...readCommandData(CmdName)}
  const givenCmd = commands.filter( c => c.name === CmdName ).pop()

  // initialize using the command 
  if(!givenCmd) {
    console.log('Invalid command', CmdName)
    process.exit()
  } else {
    initData = { ...givenCmd.init, ...initData }
    for( let key of Object.keys( initData ) ) {
      if(!initData[key]) {
        initData[key] = readlineSync.question(key + ' : ');
      }
    }
  }
}

// Finding the commands...

// try the commands...

const fileSystem = new CodeFileSystem();
const rootFile = fileSystem.getFile('/', 'README.md');
const wr = rootFile.getWriter()

wr.setState( initData )

// run all the commands...
for( let Name of argv._) {
  console.log('Command ', Name)
  let ScriptFile = Name
  let ScriptFunction = Name
  const parts = Name.split('/')
  if(parts.length == 2) {
    ScriptFile = parts[0]
    ScriptFunction = parts[1]
  }  
  const cmd = require(rootPath + '/' + ScriptFile)
  cmd[ScriptFunction]( wr )
}


// Then save results...
fileSystem.saveTo( process.cwd() + '/' +  (outputDir || ''))

// const writer = CodeWriter.withFS('')


