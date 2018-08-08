"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = {
    "name": ''
};
exports.short_doc = 'Initialize Doremifa project';
function doremifa(wr) {
    console.log('Could create the module...');
    console.log(wr.getState());
    var model = wr.getState();
    wr.getFileWriter('/', 'doremifa.md').raw("\n# " + model.name + "\n\nOk, this could be the Doremifa example application with\nthe directory structure required for it...\n\n");
    // create the typescript configuration file...
    wr.getFileWriter('/', 'tsconfig.json').raw("{\n    \"compilerOptions\": {\n      \"target\": \"es5\",\n      \"moduleResolution\": \"node\",\n      \"module\": \"commonjs\",\n      \"rootDir\": \".\",\n      \"outDir\": \"dist\",\n      \"allowSyntheticDefaultImports\" : true,\n      \"sourceMap\": true,\n      \"inlineSources\": true,    \n      \"declaration\": true,\n      \"emitDecoratorMetadata\": true,\n      \"experimentalDecorators\": true,\n      \"removeComments\": false,\n      \"noImplicitAny\": false,\n      \"jsx\": \"react\",\n      \"lib\": [\"es6\", \"es2015\",\"dom\"]\n    },\n    \"include\": [\n        \"./**/*\",\n    ],  \n    \"exclude\": [\n      \"dist/**/*\",\n      \"node_modules\",\n      \".npm\",\n      \"docs\",\n    ]  \n  }  \n  ", true);
    // write the package json file
    var p = wr.getFileWriter('/', 'package.json');
    p.raw("{\n  \"name\": \"" + model.name + "\",\n  \"version\": \"1.0.0\",\n  \"description\": \"" + model.name + "\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"test\": \"find ./dist/ -name \\\"*.d.ts\\\" -delete && tsc && ./node_modules/.bin/mocha dist/test/ --recursive --reporter spec\"\n  },\n  \"keywords\": [\n  ],\n  \"author\": \"Tero Tolonen\",\n  \"license\": \"MIT\",\n  \"dependencies\": {\n    \"@types/chai\": \"^4.1.4\",\n    \"@types/mocha\": \"^5.2.5\",\n    \"@types/node\": \"^10.5.6\"\n  },\n  \"devDependencies\": {\n    \"chai\": \"^4.1.2\",\n    \"mocha\": \"^5.2.0\"\n  }\n}\n    ", true);
}
exports.doremifa = doremifa;
//# sourceMappingURL=doremifa.js.map