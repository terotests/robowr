

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
  indentAmount:number = 0

  compiledTags:{[key:string]:boolean} = {}
  
  // Code Writer Tags...
  tags:{[key:string]:CodeWriter} = {}

  slices:CodeSlice[] = []
  current_slice:CodeSlice
  forks:CodeWriter[]

  tagOffset:number = 0 
  parent:CodeWriter

  had_nl = true

  constructor() {
    const new_slice = new CodeSlice ()
    this.slices.push( new_slice )
    this.current_slice = new_slice
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
    this.indentAmount = this.indentAmount + delta
    if(this.indentAmount < 0) {
      this.indentAmount = 0
    }
    return this
  } 

  addIndent() {
    let i = 0 
    if ( 0 == this.currentLine.length)  {
      while (i < this.indentAmount) {
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
    new_writer.indentAmount = this.indentAmount

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
    new_writer.indentAmount = this.indentAmount

    this.slices.push( new_slice )

    const new_active_slice = new CodeSlice()
    this.slices.push( new_active_slice )
    this.current_slice = new_active_slice
    return new_writer
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

  raw (str:string, newLine:boolean) : CodeWriter {
    const lines:string[] = str.split('\n');
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