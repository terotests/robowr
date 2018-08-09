
// The application generator has a global state
let globalState = {
  state : {}
}


export class CodeSlice {

  code:string = ''
  writer:CodeWriter 

  getCode():string {
    if(!this.writer) return this.code
    return this.writer.getCode()
  }
}

export class CodeWriter {

  ownerFile : CodeFile
  tagName:string = ""
  codeStr:string = ""
  currentLine:string = ""
  tabStr:string = "  "
  nlStr = "\n"
  lineNumber:number = 1
  _indentAmount:number = 0

  compiledTags:{[key:string]:boolean} = {}
  
  // Code Writer Tags...
  tags:{[key:string]:CodeWriter} = {}

  slices:CodeSlice[] = []
  current_slice:CodeSlice
  forks:CodeWriter[]

  tagOffset:number = 0 
  parent:CodeWriter

  had_nl = true

  state = {}

  constructor() {
    const new_slice = new CodeSlice ()
    this.slices.push( new_slice )
    this.current_slice = new_slice
  }  

  setState( ...objs:any[] ) {
    for(let obj of objs) {
      globalState.state = { ...globalState.state, ...obj}
    }
  }

  getState() : any {
    return globalState.state
  }

  getFilesystem():CodeFileSystem {
    if( !this.ownerFile ) {
      if(!this.parent) {
          return (this.parent.getFilesystem())
      }
      throw 'The Writer has no filesystem assigned'
    }
    if(!this.ownerFile.fileSystem) throw 'The Writer has no filesystem assigned'
    return this.ownerFile.fileSystem
  }  

  findFile(path:string, fileName:string) : CodeFile {
    if( !this.ownerFile ) {
      if(this.parent) return this.parent.findFile( path, fileName)
      throw "getFileWriter: no filesystem defined for the writer"
    }
    const fs = this.ownerFile.fileSystem
    return fs.getFile( path, fileName )
  }   

  getFileWriter(path:string, fileName:string) : CodeWriter {
    if( !this.ownerFile ) {
      if(this.parent) return this.parent.getFileWriter( path, fileName)
      throw "getFileWriter: no filesystem defined for the writer"
    }
    const fs = this.ownerFile.fileSystem
    const file = fs.getFile( path, fileName )
    const wr = file.getWriter()
    return wr
  }     
  
  static withFS(path:string, fileName:string):CodeWriter {
    return (new CodeFileSystem).getFile(path, fileName).getWriter()
  }   

  static emptyWithFS():CodeWriter {
    const wr = new CodeWriter ()
    const file = new CodeFile (".", "emptyFile.txt");
    file.writer = wr
    file.fileSystem = (new CodeFileSystem)
    wr.ownerFile = file
    return wr
  }  

  createTag( tag:string ) {

  }

  // replacte all the contents of the file with this data...
  rewrite(str:string) {

  }

  indent(delta:number) : CodeWriter {
    this._indentAmount = this._indentAmount + delta
    if(this._indentAmount < 0) {
      this._indentAmount = 0
    }
    return this
  } 

  addIndent() {
    let i = 0 
    if ( 0 == this.currentLine.length)  {
      while (i < this._indentAmount) {
        this.currentLine = this.currentLine + this.tabStr
        i = i + 1
      }
    }
  }  

  findTag (name:string) : CodeWriter {
    if(this.tags[name]) return this.tags[name]
    if(this.parent) this.parent.findTag( name )
    return null
  }

  // creates a tagged writer at this position...
  tag (name:string) :CodeWriter {
    
    const had = this.findTag( name )
    if(had) return had

    const new_writer = new CodeWriter ()
    const new_slice = new CodeSlice()
    new_slice.writer = new_writer
    new_writer.parent = this    // connects to the file system

    // think: should this be irrelevant ? 
    new_writer._indentAmount = this._indentAmount

    this.tags[name] = new_writer
    this.slices.push(new_slice)

    const new_active_slice = new CodeSlice()
    this.slices.push( new_active_slice )
    this.current_slice = new_active_slice
    return new_writer
  } 

  // creates a new fork position for the code writing...
  fork() :CodeWriter {
    const new_writer = new CodeWriter ()
    const new_slice = new CodeSlice ()
    new_slice.writer = new_writer
    new_writer.parent = this
    new_writer._indentAmount = this._indentAmount

    this.slices.push( new_slice )

    const new_active_slice = new CodeSlice()
    this.slices.push( new_active_slice )
    this.current_slice = new_active_slice
    return new_writer
  }  

  pushSlice() {
    this.current_slice.code = this.current_slice.code + this.currentLine
    this.currentLine = ""
  }

  newline() : CodeWriter {
    if ( (this.currentLine.length) > 0) {
      this.out("", true)
    }
    return this
  }


  writeSlice (str:string, newLine:boolean) {
    this.addIndent()
    this.currentLine = this.currentLine + str
    if(newLine) {
      this.current_slice.code = this.current_slice.code + this.currentLine + this.nlStr
      this.currentLine = ""
    }
  }

  out (str:string, newLine:boolean = false) : CodeWriter {
    const lines:string[] = str.split('\n'); // (strsplit str "\n")
    const rowCnt = lines.length
    if (rowCnt == 1) {
      this.writeSlice(str, newLine)
    } else {
      for(let i=0; i<lines.length;i++) {
        const row = lines[i]
        this.addIndent()
        if ( i < (rowCnt - 1) ) {
          this.writeSlice( row.trim(), true)
        } else {
          this.writeSlice( row, newLine )
        }
      }
    }   
    return this
  }

  raw (str:string, newLine:boolean = false) : CodeWriter {
    const lines:string[] = str.split('\n');
    const rowCnt = lines.length
    if (rowCnt == 1) {
      this.writeSlice(str, newLine)
    } else {
      for(let i=0; i<lines.length;i++) {
        const row = lines[i]
        this.addIndent()
        if ( i < (rowCnt - 1) ) {
          this.writeSlice( row, true)
        } else {
          this.writeSlice( row, newLine )
        }
      }
    }   
    return this  
  }

  getCode() :string {
    let res = "";
    for( let slice of this.slices ) {
      res = res + (slice.getCode())
    }
    res = res + this.currentLine
    return res
  }  

}

export class CodeFileSystem {

  files:CodeFile[] = []

  getFile (path:string, name:string) : CodeFile {
    for( let file of this.files ) {
      if(file.path_name === path && file.name === name) return file
    }
    const new_file = new CodeFile (path , name)
    new_file.fileSystem = this
    this.files.push( new_file );
    return new_file
  }  

  hasTagStart( str:string, tag:string, index:number) : boolean {
    let i = 0
    let len = tag.length
    while( len > 0 ) {
      if( str.charAt(index + i) !== tag.charAt(  i ) ) return false
      len--;
      i++;
    }
    return true
  }

  readTagName( str:string, index:number) : string {
    let name = ''
    let i = 0
    let max_len = str.length
    while( (index + i) < max_len ) {
      if( str.charAt( index + i) == ')') {
        return str.substring( index, index + i)
      }
      i++;
    }
    return ''
  }
  

  // tagstart can be like tag#...
  openTaggedFile( path:string, name:string, tagStart:string, tagEnd:string ) : CodeFile {
    for( let file of this.files ) {
      if(file.path_name === path && file.name === name) return file
    }

    const data = (require('fs')).readFileSync(path + name, 'utf8')
    const slices = []
    let last_i = 0

    const wr = new CodeWriter()
    for(let i=0; i<data.length; i++) {
      // like //tag
      if(this.hasTagStart( data, tagStart, i)) {
        const tagName = this.readTagName( data, i + tagStart.length + 1)
        if(tagName) {
          i = i + tagStart.length + tagName.length + 2
          let start_index = i
          let end_index = i
          // The position where to insert the code...
          for( let a = i; a < data.length; a++) {
            if(this.hasTagStart( data, tagEnd, a)) {
              end_index = a  
              break
            }            
          }
          if(end_index > start_index) {
            wr.raw( data.substring(last_i, start_index), false )
            wr.pushSlice()
            wr.tag(tagName)
            i = end_index + tagEnd.length
            last_i = end_index
          }
        }
      }
    }
    wr.raw( data.substring( last_i ), false)
    const new_file = new CodeFile (path , name)
    new_file.fileSystem = this
    this.files.push( new_file );
    new_file.writer = wr
    return new_file    
  }


  mkdir (path:string) {
    const fs = require('fs')
    const parts:string[] = path.split('/')
    let curr_path = ''
    for( let p of parts ) {
      curr_path = curr_path + p + '/'
      if(!fs.existsSync(curr_path)) {
        fs.mkdirSync(curr_path);
      }
    }
  }

  async saveTo (root_path:string) : Promise<any[]> {
    const fs = require('fs')
    const last_cmd = []
    const versioned = []

    let old_data = null
    try {
      old_data = JSON.parse( fs.readFileSync( root_path + '/.robowr/last.json', 'utf8') )
    } catch(e) {

    }

    for(let file of this.files) {
      const file_path = root_path + '/' + file.path_name
      this.mkdir(file_path)     
      const data = file.getCode()
      if(data.length > 0 ) {
        const path = file_path + '/' + file.name.trim()

        // check if the file has changed
        let current_data = ''
        try {
          current_data = fs.readFileSync(path, 'utf8')
        } catch(e) {

        }
        const obj = {
          changed : current_data !== data ,
          removed : false,
          path : path,
          data : data
        }      
        versioned.push( obj )
        last_cmd.push({ path, data })
        fs.writeFileSync( path, data )
      }
    }
    if(old_data) {
      for( let old_file of old_data ) {
        const has = versioned.filter( v => v.path === old_file.path ).pop()
        if(!has) {
          versioned.push( {
            ...old_file,
            removed : true
          })
        }
      }  
    }
    this.mkdir(root_path + '/.robowr')
    fs.writeFileSync( root_path + '/.robowr/last.json', JSON.stringify(last_cmd, null, 2) )
    return versioned
  }  
}

export class CodeFile {

  path_name:string = ""
  name:string = ""
  writer:CodeWriter

  import_list:{[key : string]:string}
  fileSystem:CodeFileSystem

  constructor (filePath:string, fileName:string) {
      this.name = fileName
      this.path_name = filePath
      this.writer = (new CodeWriter())
      this.writer.createTag("imports")        
  }

  addImport (import_name:string) {
    if( !this.import_list[import_name] ) {
      this.import_list[import_name] = import_name 
    }
  }

  rewrite (newString:string ) {
      this.writer.rewrite(newString)
  }
  
  getImports():string[] {
    return Object.keys( this.import_list )
  }

  getWriter():CodeWriter {
    this.writer.ownerFile = this
    return this.writer
  }

  getCode():string {
    return this.writer.getCode()
  }

}