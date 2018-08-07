"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ThisIsNotOverwritten = /** @class */ (function () {
    function ThisIsNotOverwritten() {
    }
    return ThisIsNotOverwritten;
}());
//tag(foobar)
function foobar() {
    // created using the Foo!
}
//endtag
function notOwerWritten() {
    // The colors could be written here:
    //tag(colors)
    var colors = [
        'red',
        'blue',
        'green',
        'orange',
    ];
    //endtag
    return 1234;
}
//# sourceMappingURL=input.js.map