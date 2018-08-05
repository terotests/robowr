"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
var _1 = require("../src/writer/");
var expect = require("chai").expect;
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
});
//# sourceMappingURL=test_writer.js.map