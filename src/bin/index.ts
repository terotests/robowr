#!/usr/bin/env node

import {CodeWriter, CodeFileSystem} from '../writer/'

const argv = require('minimist')(process.argv.slice(2));
var readlineSync = require('readline-sync');

const rootPath = process.env.ROBOWR || process.cwd() + '/.robowr/';
const fs = require('fs')

console.log(argv);

const commands = []

const find_cmd = (name) => {
  return commands.filter( c => c.name === name ).pop()
}


const find_commands = (rootPath) => {
  fs.readdirSync(rootPath).forEach(file => {
    const name = file.split('.')[0]
    const ext = file.split('.')[1]
    if(ext === 'js') {
      try {
        const cmd = require(rootPath + '/' + file)
        commands.push( {
          name,
          require_path : rootPath + '/' + file,
          short_doc : cmd.short_doc || '',
          long_doc : cmd.long_doc || '',
          init : cmd.init || {}
        })
      } catch(e) {
  
      }
    }
  })   
}

if(process.env.ROBOWR) find_commands(process.env.ROBOWR)
find_commands(process.cwd() + '/.robowr/cmds/')


console.log(commands)

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

const outputDir = argv.o || argv.output
if(!outputDir) {
  console.log('robowr <commands> --o <outputdir> --m <message>')
  console.log('Please give the output directory')
  process.exit()
}

const commitMsg = argv.m || argv.message || 'robowr'
if(!commitMsg) {
  console.log('robowr <commands> --m <message>  --m <message>')
  console.log('Please give the commit message')
  process.exit()
}

// console.log(fs.readFileSync('/dev/stdin').toString());
let initData = {}

const data_files = []

const readCommandData = ( CmdName : string ) : any => {

  // try from .robowr subdirectory
  try {
    const TryData = fs.readFileSync( process.cwd() + '/.robowr/data/' + CmdName + '.json', 'utf8' )
    const TryObj = JSON.parse(TryData)
    const c = find_cmd( CmdName )
    c.initData = TryObj
    return TryObj;
  } catch(e) {

  }

  // try from current directory with file having the same name
  try {
    const TryData = fs.readFileSync( process.cwd() + '/' + CmdName + '.json', 'utf8' )
    const TryObj = JSON.parse(TryData)

    const c = find_cmd( CmdName )
    c.initData = TryObj
    
    return TryObj;
  } catch(e) {

  }  
  const c = find_cmd( CmdName )
  c.initData = {}
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

// Try using the git...


const save_data = async () => {
  const fileSystem = new CodeFileSystem();
  const rootFile = fileSystem.getFile('/', 'README.md');
  const wr = rootFile.getWriter()
  
  wr.setState( initData )
  
  // run all the commands...
  for( let Name of argv._) {
    const command = find_cmd( Name )
    const cmd = require(command.require_path)
    
    // read the source 
    const cmd_src = fs.readFileSync( command.require_path, 'utf8' )
    const cmd_wr = wr.getFileWriter('.robowr/cmds/', Name + '.js')
    cmd_wr.raw( cmd_src ) 

    const cmd_data_wr = wr.getFileWriter('.robowr/data/', Name + '.json')
    cmd_data_wr.raw( JSON.stringify( command.initData, null, 2 ) )    
    cmd.run( wr )
  }
  
  // save and get versioned files...
  const targetDir = process.cwd() + '/' +  (outputDir || '')
  const versioned = await fileSystem.saveTo(targetDir )  

  const changed = versioned.filter( o => o.changed )

  console.log(changed)

  let had_changes = false
  const simpleGit = require('simple-git/promise')(targetDir);  

  if(changed.length) {
    for( let f of changed ) {
      simpleGit.add( f.path )
      had_changes = true
    }    
  }

  for( let removed of versioned.filter( o => o.removed ) ) {
    console.log('removing file ', removed.path)
    await simpleGit.rm( removed.path )
    had_changes = true
  }  

  if( had_changes ) {
    await simpleGit.commit(commitMsg)
    await simpleGit.push()
  }

}

save_data()

