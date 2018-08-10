"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function run(wr) {
    const readme = wr.getFileWriter('/', 'README.md')
        .out(`## Added by test`);
    const p = wr.findFile('/', 'package.json');
    const pData = JSON.parse(p.getCode());
    console.log('deps : ', pData.dependencies);
    readme.out(`
# Dependencies
${Object.keys(pData.dependencies).map(d => ` - ${d} `).join('\n')}  
  `);
}
exports.run = run;
exports.short_doc = 'Test';
// the configuration...
exports.init = {};
//# sourceMappingURL=test.js.map