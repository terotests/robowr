

import 'mocha';
import { CodeWriter } from '../src/writer/'

const expect    = require("chai").expect;

describe("writer testing", function() {

  it('simple writer', () => {
    const wr = new CodeWriter()
    const txt = `
global.foob = function foob() {
  return 100
}    
    `
    wr.out(txt, false);
    const result = eval(wr.getCode())
    expect(eval('foob()')).to.equal(100)
  });  
  it('test forking and tags', () => {
    const wr = new CodeWriter()
    const comments = wr.tag('comment')
    wr.out('global.foob = function foob() {', true)
    wr.indent(1)
    const body = wr.fork()
    wr.newline().indent(-1)
    wr.out('}', true)
    body.out('return returnValue', true)
    comments.out('// Test Comment Here ...', true)
    comments.out('var returnValue = 212;', true)

    eval(wr.getCode())
    console.log(wr.getCode())
    expect(eval('foob()')).to.equal(212)
  });  
   
});

