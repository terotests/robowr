#!/usr/bin/env node

import {CodeWriter, CodeFileSystem} from '../writer/'

const argv = require('minimist')(process.argv.slice(2));
var readlineSync = require('readline-sync');

const rootPath = process.env.ROBOWR || process.cwd() + '/.robowr/';
const fs = require('fs')
const path = require('path')

console.log('RoboWR 0.01')
console.log(argv);

const outputDir = argv.o || argv.output
if(!outputDir) {
  console.log('robowr <commands> --o <outputdir> --m <message>')
  console.log('Please give the output directory')
  process.exit()
}

const commands = []

const find_cmd = (name) => {
  return commands.filter( c => c.name === name ).pop()
}

const find_commands = (rootPath) => {
  try {
    fs.readdirSync(rootPath).forEach(file => {
      const name = file.split('.')[0]
      const ext = file.split('.')[1]
      if(find_cmd(name)) return
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
  } catch(e) {

  }
}

find_commands(  path.normalize( process.cwd() + '/' + outputDir + '/.robowr/cmds/' ) ) 
if( argv.a ) {
  commands.forEach( c => {
    if(argv._.indexOf( c.name ) < 0) {
      argv._.push( c.name )
    }
  })
}
find_commands(process.cwd() + '/.robowr/cmds/')
if( argv.a ) {
  commands.forEach( c => {
    if(argv._.indexOf( c.name ) < 0) {
      argv._.push( c.name )
    }
  })
}

console.log(argv)

if(process.env.ROBOWR) find_commands(process.env.ROBOWR)


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

  // try from the output directory
  try {
    console.log('try ', process.cwd() + '/' + outputDir + '/.robowr/data/' + CmdName + '.json')
    const TryData = fs.readFileSync( process.cwd() + '/' + outputDir + '/.robowr/data/' + CmdName + '.json', 'utf8' )
    const TryObj = JSON.parse(TryData)
    const c = find_cmd( CmdName )
    c.initData = TryObj
    return TryObj;
  } catch(e) {

  }

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
  if(!c) {
    throw "Invalid Command " + CmdName
  }
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
  }
}

for( let key of Object.keys( initData ) ) {
  if(!initData[key]) {
    initData[key] = readlineSync.question(key + ' : ');
  }
}



const save_data = async () => {
  const fileSystem = new CodeFileSystem();

  const rootFile = fileSystem.getFile('/', '.');
  const wr = rootFile.getWriter()
  
  wr.setState( initData )

  const write_history = []
  const all_cmds = []

  // run all the commands...
  for( let Name of argv._) {
    
    all_cmds.push(Name)

    let file_i = fileSystem.files.length

    const command = find_cmd( Name )
    const cmd = require(command.require_path)
    
    // read the source 
    const cmd_src = fs.readFileSync( command.require_path, 'utf8' )
    const cmd_wr = wr.getFileWriter('.robowr/cmds/', Name + '.js')
    cmd_wr.raw( cmd_src ) 

    const cmd_data_wr = wr.getFileWriter('.robowr/data/', Name + '.json')
    cmd_data_wr.raw( JSON.stringify( command.initData, null, 2 ) )    
    cmd.run( wr )
    while( file_i < fileSystem.files.length) {
      const f = fileSystem.files[file_i]
      write_history.push({
        cmd  : Name,
        path : f.path_name,
        name : f.name,
        data : f.getCode(),
        file : f
      })
      file_i++;
    } 
  }

  // update latest code
  write_history.forEach( h => {
    h.data = h.file.getCode()
    delete h.file
  })

  // TODO: check which commands are enabled and then update the filesystem
  // accordingly by removing the files which are missing and not written using
  // the current command set...

  const targetDir = process.cwd() + '/' +  (outputDir || '')
  let prevWriteHistory = null
  try {
    prevWriteHistory = JSON.parse( fs.readFileSync( targetDir + '/.robowr/writes/history.json', 'utf8') )
  } catch(e) {

  }
  const simpleGit = require('simple-git/promise')(targetDir);  
  const is_git = await simpleGit.checkIsRepo()
  const newList = []
  const this_cmd_list = []
  if(prevWriteHistory) {
    for( let old of prevWriteHistory) {
      // if the command is in the list of possible commands...
      const had = all_cmds.filter( command => command === old.cmd ).pop()
      if(had) {
        this_cmd_list.push( old )
      } else {
        newList.push( old )
      }
    }
  }

  await fileSystem.saveTo( targetDir );  

  let had_changes = false
  const normalizePath = ( item ) => {
    return path.normalize( targetDir + '/' + item.path + '/' + item.name.trim() ) 
  }
  const processed = {}
  for( let old_file of this_cmd_list ) {
    // 
    const curr_file = write_history.filter( v => normalizePath(v) === normalizePath( old_file) ).pop()
    if(!curr_file) {
      console.log(`removed : ${normalizePath( old_file )}`)
      had_changes = true
      if(is_git) {
        await simpleGit.rm( normalizePath( old_file ) )
      } else {
        fs.unlinkSync( normalizePath( old_file ) )
      }
    } else {
      newList.push( curr_file )
      processed[normalizePath( old_file )] = true
      if(old_file.data !== curr_file.data) {
        had_changes = true
        if(is_git) await simpleGit.add( normalizePath( old_file ) )
        console.log(`changed : ${normalizePath( old_file )}`)
      } 
    }
  }  
  for( let new_file of write_history ) {
    if(!processed[normalizePath( new_file )]) {
      had_changes = true
      newList.push( new_file )
      console.log(`added : ${normalizePath( new_file )}`)      
      if(is_git) await simpleGit.add( normalizePath( new_file ) )
    }
  }

  // TODO: write the history of the files...
  const writeHistory = JSON.stringify(newList, null, 2)
  wr.getFileWriter('.robowr/writes/', 'history.json').raw(writeHistory)

  // write again...
  await fileSystem.saveTo( targetDir ); 
  
  // save and get versioned files...

  if( is_git && had_changes ) {
    await simpleGit.commit(commitMsg)
    await simpleGit.push()
    console.log('*** pushed to git ***')
  }     

  if(!had_changes) {
    console.log('Nothing changed.')
  }
}

save_data()

