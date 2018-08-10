# Who is Robowr?

Robowr is a code generator, which can generate any code that can be written in texd format. Basicly anything, so just for examples sake you can write Scala, Haskell, Rust C++, Java, JavaScript, Docker files, Makefiles, repositories... the only requirement is that the resulting files are in text format.

The most important featurea are:

- version control for data, generators and results using Git
- supports arbitary directory structures
- supports tags in files so code writers can inject for example headers when needed
- shared filesystem and multiple code writers
- shared data for all the writers
- maintains history file to detect changes 


# Installing 

Note that `robowr` is not ready for production.

```
npm i robowr
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

# Simple Example

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
  const state = wr.getState()
  wr.getFileWriter('/', `helloworld.js`)
    .out(`console.log("${state.hello}");`, true)
}
```
The result would be a file `helloworld.js` in root directory having text
```javascript
console.log("Hello World");
```

# Creating writers

## Reading state

```javascript
  const state = wr.getState()
```

## Saving state

```javascript
  const state = wr.getState()
```

## Tags

```javascript
module.exports.run = function ( wr ) {
  const state = wr.getState()
  wr.getFileWriter('/', `helloworld.js`)
    .out(`console.log("${state.hello}");`, true)
}
```



# Other code generator tools

- https://github.com/gretzky/golf/blob/master/golf


