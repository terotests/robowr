#!/usr/bin/env node

import {CodeWriter, CodeFileSystem} from '../writer/'
const argv = require('minimist')(process.argv.slice(2));
var readlineSync = require('readline-sync');
 
const rootPath = process.env.ROBOWR || process.cwd() + '/.robowr/';
const fs = require('fs')


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
  console.log('robowr <command> <outputdir>')
  commands.forEach( cmd => {
    console.log('  ', cmd.name, '   ', cmd.short_doc || '')
  })
  process.exit()
}

if(argv._.length < 2) {
  console.log('robowr <command> <outputdir>')
  console.log('Please give the output directory')
  process.exit()
}

// console.log(fs.readFileSync('/dev/stdin').toString());
let initData = {}

try {
  console.log(process.cwd() + '/' + argv._[0] + '.json')
  const TryData = fs.readFileSync( process.cwd() + '/' + argv._[0] + '.json', 'utf8' )
  const TryObj = JSON.parse(TryData)
  initData = { ...initData, ...TryObj }
} catch(e) {

}

if(argv._.length >= 1) {
  const cmd = argv._[0]
  const givenCmd = commands.filter( c => c.name === cmd ).pop()
  if(!givenCmd) {
    console.log('Invalid command', cmd)
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

// try the command...

const Name = argv._[0];
let ScriptFile = Name
let ScriptFunction = Name
const parts = Name.split('/')
if(parts.length == 2) {
  ScriptFile = parts[0]
  ScriptFunction = parts[1]
}

const cmd = require(rootPath + '/' + argv._[0])
const fileSystem = new CodeFileSystem();

// get data for the command...
// and then output files to the directory...

// create file...
const rootFile = fileSystem.getFile('/', 'README.md');

// (new CodeFileSystem).getFile(path, fileName).getWriter()
const wr = rootFile.getWriter()
wr.setState( initData )

// Run command for the writer
cmd[ScriptFunction]( wr )

// Then save results...
fileSystem.saveTo( process.cwd() + '/' +  (argv._[1] || ''))

// const writer = CodeWriter.withFS('')


