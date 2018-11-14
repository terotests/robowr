"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const writer_1 = require("../src/writer/");
const expect = require("chai").expect;
const colors = {
    colors: ['red', 'blue', 'green', 'orange']
};
const platforms = {
    platforms: ['ios', 'android', 'macos']
};
const wr = new writer_1.CodeWriter();
wr.setState(colors, platforms);
function write_colors(wr) {
    const colors = wr.getState().colors;
    wr.newline();
    wr.out('', true);
    wr.out('const colors = [', true);
    wr.indent(1);
    colors.forEach(c => {
        wr.out(`'${c}',`, true);
    });
    wr.indent(-1);
    wr.out(']', true);
    wr.newline();
}
// All kinds of configurations...
// colors:['red', 'green', 'blue']
// apps:[]
// platforms:[]
// ... etc.
describe("writer testing", function () {
    it('simple writer', () => {
        const wr = new writer_1.CodeWriter();
        const txt = `
global.foob = function foob() {
  return 100
}    
    `;
        wr.out(txt, false);
        const result = eval(wr.getCode());
        expect(eval('foob()')).to.equal(100);
    });
    it('test forking and tags', () => {
        const wr = new writer_1.CodeWriter();
        const comments = wr.tag('comment');
        wr.out('global.foob = function foob() {', true);
        wr.indent(1);
        const body = wr.fork();
        wr.newline().indent(-1);
        wr.out('}', true);
        body.out('return returnValue', true);
        comments.out('// Test Comment Here ...', true);
        comments.out('var returnValue = 212;', true);
        eval(wr.getCode());
        console.log(wr.getCode());
        expect(eval('foob()')).to.equal(212);
    });
    it('test filesystem', () => {
        const wr = writer_1.CodeWriter.withFS('/', 'myFile.js');
        wr.out(`

// OK, this is one of the files :)
    
    `);
        const fs = wr.getFilesystem();
        const file2 = wr.getFileWriter('/', 'README.md');
        file2.tag('start');
        file2.out('# Hello There', true);
        file2.out(`
Let see how this works out ???    
    `, true);
        const file3 = wr.getFileWriter('/', 'README.md');
        file3.out('# Otsikko 2', true);
        file3.tag('start').out('inserted to start...', true);
        console.log(fs);
        console.log(file3.getCode());
        // tagged file, write something into existing file...
        const tagged = fs.openTaggedFile('./test/', 'input.ts', '//tag', '//endtag');
        tagged.getWriter().tag('foobar').out(`
      function foobar() {
        // created using the Foo!
      }
    `, true);
        write_colors(tagged.getWriter().tag('colors'));
        const file_sys = require('fs');
        file_sys.writeFileSync('./test/input.ts', tagged.getCode());
        console.log(fs);
        fs.saveTo('./test/output');
    });
    it('Test Prettier', () => {
        const wr = writer_1.CodeWriter.withFS('/', 'someFile.js');
        const file2 = wr.getFileWriter('/', 'example.ts');
        file2.out(`

    class meee { jee() {} joo() {}}
  
function foo (a:string) : string {  
  const x = 4 
      return  ' aaa'  
    }
    `);
        console.log(file2.getCode('test.ts', true));
        const fs = wr.getFilesystem();
        fs.saveTo('./test/output', { usePrettier: true });
    });
});
//# sourceMappingURL=test_writer.js.map