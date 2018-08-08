

import { CodeWriter } from '../writer'

export const init = {
  "name": ''
}

export const short_doc = 'Initialize Doremifa project';

export function doremifa( wr : CodeWriter ) {

  console.log('Could create the module...')
  console.log(wr.getState())
  const model = wr.getState();

  wr.getFileWriter('/', 'doremifa.md').raw(
`
# ${model.name}

Ok, this could be the Doremifa example application with
the directory structure required for it...

`) 

  // create the typescript configuration file...
  wr.getFileWriter('/', 'tsconfig.json').raw(
    `{
    "compilerOptions": {
      "target": "es5",
      "moduleResolution": "node",
      "module": "commonjs",
      "rootDir": ".",
      "outDir": "dist",
      "allowSyntheticDefaultImports" : true,
      "sourceMap": true,
      "inlineSources": true,    
      "declaration": true,
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "removeComments": false,
      "noImplicitAny": false,
      "jsx": "react",
      "lib": ["es6", "es2015","dom"]
    },
    "include": [
        "./**/*",
    ],  
    "exclude": [
      "dist/**/*",
      "node_modules",
      ".npm",
      "docs",
    ]  
  }  
  `, true)

  // write the package json file
  const p = wr.getFileWriter('/', 'package.json');
  p.raw(`{
  "name": "${model.name}",
  "version": "1.0.0",
  "description": "${model.name}",
  "main": "index.js",
  "scripts": {
    "test": "find ./dist/ -name \\"*.d.ts\\" -delete && tsc && ./node_modules/.bin/mocha dist/test/ --recursive --reporter spec"
  },
  "keywords": [
  ],
  "author": "Tero Tolonen",
  "license": "MIT",
  "dependencies": {
    "@types/chai": "^4.1.4",
    "@types/mocha": "^5.2.5",
    "@types/node": "^10.5.6"
  },
  "devDependencies": {
    "chai": "^4.1.2",
    "mocha": "^5.2.0"
  }
}
    `, true)
}