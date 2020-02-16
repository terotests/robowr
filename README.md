# Robowr Code Generator Library 2.0

Robowr is a code generator, which can generate any code that can be written in text format.

# New in version 2.0

- Support for Array -based short hand syntax for indendation, block can be expressed using Array literal `[[ ]]`
- Since TypeScript 3.7 supports recursive types, we can now generate code using generic context based generators.

# Example

Contexts are now generic, so you can use any support data as parameter to the writer.

First initialize the context

```typescript
import * as R from "robowr";

// The data used by the robowr
const data = {
  users : [
    'user 1',
    'user 2',
    'user 3'
  ]
}
const ctx = R.CreateContext( { users:[] } );
```

Then you can create code using the context and return string, arrays, nested arrays (blocks)
or functions which will be evaluated lazily.

```typescript
  const newCtx = R.Walk( ctx, ctx => 
    [`switch( value ) {`,
    ...ctx.data.values.map( name => [
      [`case "${name}":`,
      [[
        `console.log("Found value ${name}");`,
        'break;'
      ]]
    ]
    ]),
    '}']
    )
```

To get the code call `newCtx.writer.getCode()`

```typescript
    // The generated code from above
    switch( value ) {
      case "value1":
        console.log("Found value value1");
        break;
      case "value2":
        console.log("Found value value2");
        break;
      case "value3":
        console.log("Found value value3");
        break;
    }
```

Since context is passed to callback functions you can use them to fine grained control of the
generator or you can use then just to make code easier to write

```typescript
// simple function returning a comment block
const CreateIfNode = <T extends R.hasWriter>(
  condition: R.CodeBlock<T>,
  thenBlock: R.CodeBlock<T>,
  elseBlock?: R.CodeBlock<T>
) => {
  return [
    R.Join(["if(", condition, ") {"]),
    [[thenBlock]],
    elseBlock ? ["} else {", [[elseBlock]], "}"] : "}"
  ];
};
```

```typescript
R.Walk(ctx, [
  CreateIfNode(
    "x > 10",
    "console.log('x was bigger than ten');",
    "console.log('x was smaller or equal to ten');"
  )
]);
```

# Installing

```
npm i robowr
```

# Using CodeWriter

CodeWriter is the class used for writing data into files. It has some useful functions like

- Write to any file using `wr.getFileWriter("path", "file")`
- create a tagged fork with `wr.tag("...")`
- create anonymous fork with `wr.fork()`

## Prettier support

```typescript
const prettierCode = someFilesystem.saveTo("./test/output", {
  usePrettier: true
});
```

or

```typescript
const prettierCode = someFile.getCode("test.ts", true);
```

or

```typescript
const prettierCode = someWriter.getCode("fileName.ts", true);
```

## CodeWriter::getFileWriter(<path>, <filename>)

Opens existing or creates a new writer in the filesystem for some file.

```javascript
const newWriter = wr.getFileWriter("/", `helloworld.js`);
newWriter.out("...");
```

## CodeWriter::out(<string>, <newline>)

`out` writes a string using current indent level and optionally outputting a newline

```javascript
wr.out("something", true); // something + newline
```

## CodeWriter::raw(<string>, <newline>)

Writes a raw string using indent levels from the input string

## CodeWriter::indent(<change>)

Change indent level to create prettier formatting for output

```javascript
wr.out("function foobar() {", true);
wr.indent(1);
wr.out('return "Hello World"', true);
wr.indent(-1);
wr.out("}", true);
```

## State

State for all writers is global. It is a combination of all the `.json` files read.

The state makes possible for different writers to create different views from same input data, for example from SQL database model you can create queries, stored procedures, Model views for server and client etc.

You can read the state using

```javascript
const state = wr.getState();
```

And you can set new values to state using

```javascript
wr.setState({ newKey: true });
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

# Command line Usage

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
module.exports.run = function(wr) {
  // read the state corresponding .json files
  const state = wr.getState();
  // create a writer for helloworld.js and write something in it
  wr.getFileWriter("/", `helloworld.js`).out(
    `console.log("${state.hello}");`,
    true
  );
};
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
