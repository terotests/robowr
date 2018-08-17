# Who is Robowr?

Robowr is a code generator, which can generate any code that can be written in texd format. Basicly anything, so just for examples sake you can write Scala, Haskell, Rust C++, Java, JavaScript, Docker files, Makefiles, repositories... the only requirement is that the resulting files are in text format.

The most important features are:

- custom indent for pretty printing
- during writing uses in memory virtual filesystem for fast processing of files
- version control for data, generators and results using Git
- supports arbitary directory structures
- supports tags in files so code writers can inject for example headers when needed
- shared filesystem and multiple code writers
- shared data for all the writers
- maintains history file to detect changes 

## Current TODO

This project is not ready yet.

- working in separate branch for the Robowr by default
- merging models so that they can add new data to arrays
- saving default command settings

## Think about branch safetu

- perhaps you should always work in some branch?
- Robowr could require some working branch to be used so that master is not destroyed

## Done

- command order / priority

# Why Robowr?

You can generate beautiful code using Robowr, because all the code generated is actually coming from hand written functions, which just type the code a bit like you would using the keyboard.

When a change comes, code generator can start for the clean table, so you do not have to mutate the files on the disk by hand. Code Generator can replace a great deal of handwritten files generation with some simple `data` + `command` generator.

Refactoring can also be qutie nice, because in many cases you can just modify the inputs and the writer will just automatically create thousands of lines of repetitive code and correct all small mistakes in multiple files at once.

One of the problems with code generators is how to support version control reasonably. Robowr solves this by copying the files used for writing the output into the `.robowr/` -directory, which are saved to Git. This makes it possible to return to earlier version of the generated configuration and their writer functions.

You don't have to write all the code using `robowr`, so it plays nicely with actual human coders.


# Installing 

Note that `robowr` is not ready for production.

```
npm i -g robowr
```

# Usage

Run N commands to output directory
```
robowr cmd1 cmd2 cmd3 --o output
```

Run all commands to output directory
```
robowr --a --o output
```
Git message
```
robowr --m "Some message to git"
```

# Example

What you need is directory `.robowr` having subdirectories `cmds` and `data`. For example

```
.robowr/cmds/example.js
.robowr/data/example.json
```

The `example.json` is JSON file which has the input data for code creation. Here we have a very simple state.
```json
{
  "hello": "Hello World"
}
```

The `example.js` is npm module which gets the state and writes the code.
```javascript
module.exports.run = function ( wr ) {
  // read the state corresponding .json files
  const state = wr.getState()
  // create a writer for helloworld.js and write something in it
  wr.getFileWriter('/', `helloworld.js`)
    .out(`console.log("${state.hello}");`, true)
}
```
The result would be a file `helloworld.js` in root directory having text
```javascript
console.log("Hello World");
```

# History

Robowr maintains the write history and creates a diff with the last written result and 

- creates
- renames or
- removes

The files based on the diff with the last write.

# Using CodeWriter

CodeWriter is the class used for writing data into files. It has some useful functions like

- Write to any file using `wr.getFileWriter("path", "file")`
- create a tagged fork with `wr.tag("...")`
- create anonymous fork with  `wr.fork()`

## CodeWriter::getFileWriter(<path>, <filename>)

Opens existing or creates a new writer in the filesystem for some file.

```javascript
  const newWriter = wr.getFileWriter('/', `helloworld.js`)
  newWriter.out('...')
```

## CodeWriter::out(<string>, <newline>)

`out` writes a string using current indent level and optionally outputting a newline

```javascript
  wr.out('something', true) // something + newline
```

## CodeWriter::raw(<string>, <newline>)

Writes a raw string using indent levels from the input string

## CodeWriter::indent(<change>)

Change indent level to create prettier formatting for output

```javascript
  wr.out('function foobar() {', true)
  wr.indent(1)
    wr.out('return "Hello World"', true)
  wr.indent(-1)
  wr.out('}', true)
```


## State

State for all writers is global. It is a combination of all the `.json` files read.

The state makes possible for different writers to create different views from same input data, for example from SQL database model you can create queries, stored procedures, Model views for server and client etc.

You can read the state using

```javascript
  const state = wr.getState()
```

And you can set new values to state using

```javascript
  wr.setState({ newKey : true}) 
```


## Forks

Forks are re-entrant writing points to the file 

```javascript
  wr.out('Hello ')            // "Hello "
  const forked = wr.fork()    // forks after "Hello"
  wr.out('Friend')            // "Hello Friend"
  forked.out(' My ')          // "Hello My Friend"
}
```

## Tags

Tags are re-entrant named writing points in the file. Tags can be useful for creating for example
header includes etc.

```javascript
  wr.out('Hello ')            // "Hello "
  wr.tag('tag1')              // forks after "Hello"
  wr.out('Friend')            // "Hello Friend"

  // ...later
  wr.tag('tag1').out(' My ')  // "Hello My Friend"
}
```

# Other code generator tools

- https://github.com/gretzky/golf/blob/master/golf


