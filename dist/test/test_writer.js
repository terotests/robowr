"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
var _1 = require("../src/writer/");
var expect = require("chai").expect;
var colors = {
    colors: ['red', 'blue', 'green', 'orange']
};
var platforms = {
    platforms: ['ios', 'android', 'macos']
};
var wr = new _1.CodeWriter();
wr.setState(colors, platforms);
function write_colors(wr) {
    var colors = wr.getState().colors;
    wr.newline();
    wr.out('', true);
    wr.out('const colors = [', true);
    wr.indent(1);
    colors.forEach(function (c) {
        wr.out("'" + c + "',", true);
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
    it('simple writer', function () {
        var wr = new _1.CodeWriter();
        var txt = "\nglobal.foob = function foob() {\n  return 100\n}    \n    ";
        wr.out(txt, false);
        var result = eval(wr.getCode());
        expect(eval('foob()')).to.equal(100);
    });
    it('test forking and tags', function () {
        var wr = new _1.CodeWriter();
        var comments = wr.tag('comment');
        wr.out('global.foob = function foob() {', true);
        wr.indent(1);
        var body = wr.fork();
        wr.newline().indent(-1);
        wr.out('}', true);
        body.out('return returnValue', true);
        comments.out('// Test Comment Here ...', true);
        comments.out('var returnValue = 212;', true);
        eval(wr.getCode());
        console.log(wr.getCode());
        expect(eval('foob()')).to.equal(212);
    });
    it('test filesystem', function () {
        var wr = _1.CodeWriter.withFS('/', 'myFile.js');
        wr.out("\n\n// OK, this is one of the files :)\n    \n    ");
        var fs = wr.getFilesystem();
        var file2 = wr.getFileWriter('/', 'README.md');
        file2.tag('start');
        file2.out('# Hello There', true);
        file2.out("\nLet see how this works out ???    \n    ", true);
        var file3 = wr.getFileWriter('/', 'README.md');
        file3.out('# Otsikko 2', true);
        file3.tag('start').out('inserted to start...', true);
        console.log(fs);
        console.log(file3.getCode());
        // tagged file, write something into existing file...
        var tagged = fs.openTaggedFile('./test/', 'input.ts', '//tag', '//endtag');
        tagged.getWriter().tag('foobar').out("\n      function foobar() {\n        // created using the Foo!\n      }\n    ", true);
        write_colors(tagged.getWriter().tag('colors'));
        var file_sys = require('fs');
        file_sys.writeFileSync('./test/input.ts', tagged.getCode());
        console.log(fs);
        fs.saveTo('./test/output');
    });
});
//# sourceMappingURL=test_writer.js.map