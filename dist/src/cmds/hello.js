"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hello(wr) {
    console.log('Hello was called with ', wr.getState().message);
    wr.getFileWriter('/', 'hello.md').out(wr.getState().message, true);
}
exports.hello = hello;
exports.short_doc = 'Creates a hello world';
exports.long_doc = 'Creates a hello world';
// the configuration...
exports.init = {
    message: ''
};
//# sourceMappingURL=hello.js.map