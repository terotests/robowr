"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function run(wr) {
    console.log('Hello was called with ', wr.getState().message);
    wr.getFileWriter('/', 'hellou.md').out(wr.getState().message, true);
}
exports.run = run;
exports.short_doc = 'Creates a hello world';
exports.long_doc = 'Creates a hello world';
// the configuration...
exports.init = {
    message: ''
};
//# sourceMappingURL=hello.js.map