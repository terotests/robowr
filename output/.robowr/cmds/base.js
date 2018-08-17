"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = {
    "name": 'Base Project Test 2'
};
exports.order = 10
exports.short_doc = 'Initialize Project';
function run(wr) {
    const model = wr.getState();
    // creating the application basic structure...
    wr.getFileWriter('/src/', 'index.ts').raw(`
// the starting point of the applictaion ${model.name}
  
  `);
    wr.getFileWriter('/src/model/', 'index.ts').raw(`
// The ${model.name} models come about here
  
  `);
    wr.getFileWriter('/src/views/', 'index.ts').raw(`
// Views of ${model.name}
  
  `);
    
  const readme = wr.getFileWriter('/', 'README.md').raw(`
# Project ${model.name}

The project readme.

`);

  readme.fn( wr => {
    const state = wr.getState()
    wr.out('', true)
    wr.out('### Tables in the system', true)
    state.tables.table.forEach( tbl => {
      wr.out( ' - ' + tbl['-name'], true)
    })
  })

  readme.tag('modules').out('# Module information ', true)

  readme.out('', true)
  readme.out('The module information was added automatically', true)
  
    // create the typescript configuration file...
    wr.getFileWriter('/', 'tsconfig.json').raw(`{
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
  `, true);
    // 
    const gitIgnore = wr.getFileWriter('/', '.gitignore');
    gitIgnore.raw(`
# Dependency directories
node_modules/

# folder files
data_folder/

# Image files
*.jpg
*.png

# MacOS
.DS_Store
.idea/

# TypeScript compiled .map files
*.map  
  `);
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
    `, true);
}
exports.run = run;
//# sourceMappingURL=doremifa.js.map