"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function run(wr) {
    wr.getFileWriter('/', 'h.md').out(wr.getState().message, true);
}
exports.run = run;
exports.short_doc = 'Creates a hello world, special cmd for this system';
exports.long_doc = 'Creates a hello world';
// the configuration...
exports.init = {
    message: ''
};
//# sourceMappingURL=hello.js.map