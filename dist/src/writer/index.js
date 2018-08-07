"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// The application generator has a global state
var globalState = {
    state: {}
};
var CodeSlice = /** @class */ (function () {
    function CodeSlice() {
        this.code = '';
    }
    CodeSlice.prototype.getCode = function () {
        if (!this.writer)
            return this.code;
        return this.writer.getCode();
    };
    return CodeSlice;
}());
exports.CodeSlice = CodeSlice;
var CodeWriter = /** @class */ (function () {
    function CodeWriter() {
        this.tagName = "";
        this.codeStr = "";
        this.currentLine = "";
        this.tabStr = "  ";
        this.nlStr = "\n";
        this.lineNumber = 1;
        this._indentAmount = 0;
        this.compiledTags = {};
        // Code Writer Tags...
        this.tags = {};
        this.slices = [];
        this.tagOffset = 0;
        this.had_nl = true;
        this.state = {};
        var new_slice = new CodeSlice();
        this.slices.push(new_slice);
        this.current_slice = new_slice;
    }
    CodeWriter.prototype.setState = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i] = arguments[_i];
        }
        for (var _a = 0, objs_1 = objs; _a < objs_1.length; _a++) {
            var obj = objs_1[_a];
            globalState.state = __assign({}, globalState.state, obj);
        }
    };
    CodeWriter.prototype.getState = function () {
        return globalState.state;
    };
    CodeWriter.prototype.getFilesystem = function () {
        if (!this.ownerFile) {
            if (!this.parent) {
                return (this.parent.getFilesystem());
            }
            throw 'The Writer has no filesystem assigned';
        }
        if (!this.ownerFile.fileSystem)
            throw 'The Writer has no filesystem assigned';
        return this.ownerFile.fileSystem;
    };
    CodeWriter.prototype.getFileWriter = function (path, fileName) {
        if (!this.ownerFile) {
            if (this.parent)
                return this.parent.getFileWriter(path, fileName);
            throw "getFileWriter: no filesystem defined for the writer";
        }
        var fs = this.ownerFile.fileSystem;
        var file = fs.getFile(path, fileName);
        var wr = file.getWriter();
        return wr;
    };
    CodeWriter.withFS = function (path, fileName) {
        return (new CodeFileSystem).getFile(path, fileName).getWriter();
    };
    CodeWriter.emptyWithFS = function () {
        var wr = new CodeWriter();
        var file = new CodeFile(".", "emptyFile.txt");
        file.writer = wr;
        file.fileSystem = (new CodeFileSystem);
        wr.ownerFile = file;
        return wr;
    };
    CodeWriter.prototype.createTag = function (tag) {
    };
    // replacte all the contents of the file with this data...
    CodeWriter.prototype.rewrite = function (str) {
    };
    CodeWriter.prototype.indent = function (delta) {
        this._indentAmount = this._indentAmount + delta;
        if (this._indentAmount < 0) {
            this._indentAmount = 0;
        }
        return this;
    };
    CodeWriter.prototype.addIndent = function () {
        var i = 0;
        if (0 == this.currentLine.length) {
            while (i < this._indentAmount) {
                this.currentLine = this.currentLine + this.tabStr;
                i = i + 1;
            }
        }
    };
    CodeWriter.prototype.findTag = function (name) {
        if (this.tags[name])
            return this.tags[name];
        if (this.parent)
            this.parent.findTag(name);
        return null;
    };
    // creates a tagged writer at this position...
    CodeWriter.prototype.tag = function (name) {
        var had = this.findTag(name);
        if (had)
            return had;
        var new_writer = new CodeWriter();
        var new_slice = new CodeSlice();
        new_slice.writer = new_writer;
        new_writer.parent = this; // connects to the file system
        // think: should this be irrelevant ? 
        new_writer._indentAmount = this._indentAmount;
        this.tags[name] = new_writer;
        this.slices.push(new_slice);
        var new_active_slice = new CodeSlice();
        this.slices.push(new_active_slice);
        this.current_slice = new_active_slice;
        return new_writer;
    };
    // creates a new fork position for the code writing...
    CodeWriter.prototype.fork = function () {
        var new_writer = new CodeWriter();
        var new_slice = new CodeSlice();
        new_slice.writer = new_writer;
        new_writer.parent = this;
        new_writer._indentAmount = this._indentAmount;
        this.slices.push(new_slice);
        var new_active_slice = new CodeSlice();
        this.slices.push(new_active_slice);
        this.current_slice = new_active_slice;
        return new_writer;
    };
    CodeWriter.prototype.pushSlice = function () {
        this.current_slice.code = this.current_slice.code + this.currentLine;
        this.currentLine = "";
    };
    CodeWriter.prototype.newline = function () {
        if ((this.currentLine.length) > 0) {
            this.out("", true);
        }
        return this;
    };
    CodeWriter.prototype.writeSlice = function (str, newLine) {
        this.addIndent();
        this.currentLine = this.currentLine + str;
        if (newLine) {
            this.current_slice.code = this.current_slice.code + this.currentLine + this.nlStr;
            this.currentLine = "";
        }
    };
    CodeWriter.prototype.out = function (str, newLine) {
        if (newLine === void 0) { newLine = false; }
        var lines = str.split('\n'); // (strsplit str "\n")
        var rowCnt = lines.length;
        if (rowCnt == 1) {
            this.writeSlice(str, newLine);
        }
        else {
            for (var i = 0; i < lines.length; i++) {
                var row = lines[i];
                this.addIndent();
                if (i < (rowCnt - 1)) {
                    this.writeSlice(row.trim(), true);
                }
                else {
                    this.writeSlice(row, newLine);
                }
            }
        }
        return this;
    };
    CodeWriter.prototype.raw = function (str, newLine) {
        if (newLine === void 0) { newLine = false; }
        var lines = str.split('\n');
        var rowCnt = lines.length;
        if (rowCnt == 1) {
            this.writeSlice(str, newLine);
        }
        else {
            for (var i = 0; i < lines.length; i++) {
                var row = lines[i];
                this.addIndent();
                if (i < (rowCnt - 1)) {
                    this.writeSlice(row, true);
                }
                else {
                    this.writeSlice(row, newLine);
                }
            }
        }
        return this;
    };
    CodeWriter.prototype.getCode = function () {
        var res = "";
        for (var _i = 0, _a = this.slices; _i < _a.length; _i++) {
            var slice = _a[_i];
            res = res + (slice.getCode());
        }
        res = res + this.currentLine;
        return res;
    };
    return CodeWriter;
}());
exports.CodeWriter = CodeWriter;
var CodeFileSystem = /** @class */ (function () {
    function CodeFileSystem() {
        this.files = [];
    }
    CodeFileSystem.prototype.getFile = function (path, name) {
        for (var _i = 0, _a = this.files; _i < _a.length; _i++) {
            var file = _a[_i];
            if (file.path_name === path && file.name === name)
                return file;
        }
        var new_file = new CodeFile(path, name);
        new_file.fileSystem = this;
        this.files.push(new_file);
        return new_file;
    };
    CodeFileSystem.prototype.hasTagStart = function (str, tag, index) {
        var i = 0;
        var len = tag.length;
        while (len > 0) {
            if (str.charAt(index + i) !== tag.charAt(i))
                return false;
            len--;
            i++;
        }
        return true;
    };
    CodeFileSystem.prototype.readTagName = function (str, index) {
        var name = '';
        var i = 0;
        var max_len = str.length;
        while ((index + i) < max_len) {
            if (str.charAt(index + i) == ')') {
                return str.substring(index, index + i);
            }
            i++;
        }
        return '';
    };
    // tagstart can be like tag#...
    CodeFileSystem.prototype.openTaggedFile = function (path, name, tagStart, tagEnd) {
        for (var _i = 0, _a = this.files; _i < _a.length; _i++) {
            var file = _a[_i];
            if (file.path_name === path && file.name === name)
                return file;
        }
        var data = (require('fs')).readFileSync(path + name, 'utf8');
        var slices = [];
        var last_i = 0;
        var wr = new CodeWriter();
        for (var i = 0; i < data.length; i++) {
            // like //tag
            if (this.hasTagStart(data, tagStart, i)) {
                var tagName = this.readTagName(data, i + tagStart.length + 1);
                if (tagName) {
                    i = i + tagStart.length + tagName.length + 2;
                    var start_index = i;
                    var end_index = i;
                    // The position where to insert the code...
                    for (var a = i; a < data.length; a++) {
                        if (this.hasTagStart(data, tagEnd, a)) {
                            end_index = a;
                            break;
                        }
                    }
                    if (end_index > start_index) {
                        wr.raw(data.substring(last_i, start_index), false);
                        wr.pushSlice();
                        wr.tag(tagName);
                        i = end_index + tagEnd.length;
                        last_i = end_index;
                    }
                }
            }
        }
        wr.raw(data.substring(last_i), false);
        var new_file = new CodeFile(path, name);
        new_file.fileSystem = this;
        this.files.push(new_file);
        new_file.writer = wr;
        return new_file;
    };
    CodeFileSystem.prototype.mkdir = function (path) {
        var fs = require('fs');
        var parts = path.split('/');
        var curr_path = '';
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var p = parts_1[_i];
            curr_path = curr_path + p + '/';
            if (!fs.existsSync(curr_path)) {
                fs.mkdirSync(curr_path);
            }
        }
    };
    CodeFileSystem.prototype.saveTo = function (path) {
        var fs = require('fs');
        for (var _i = 0, _a = this.files; _i < _a.length; _i++) {
            var file = _a[_i];
            var file_path = path + '/' + file.path_name;
            this.mkdir(file_path);
            var data = file.getCode();
            if (data.length > 0) {
                fs.writeFileSync(file_path + '/' + file.name.trim(), file.getCode());
            }
        }
    };
    return CodeFileSystem;
}());
exports.CodeFileSystem = CodeFileSystem;
var CodeFile = /** @class */ (function () {
    function CodeFile(filePath, fileName) {
        this.path_name = "";
        this.name = "";
        this.name = fileName;
        this.path_name = filePath;
        this.writer = (new CodeWriter());
        this.writer.createTag("imports");
    }
    CodeFile.prototype.addImport = function (import_name) {
        if (!this.import_list[import_name]) {
            this.import_list[import_name] = import_name;
        }
    };
    CodeFile.prototype.rewrite = function (newString) {
        this.writer.rewrite(newString);
    };
    CodeFile.prototype.getImports = function () {
        return Object.keys(this.import_list);
    };
    CodeFile.prototype.getWriter = function () {
        this.writer.ownerFile = this;
        return this.writer;
    };
    CodeFile.prototype.getCode = function () {
        return this.writer.getCode();
    };
    return CodeFile;
}());
exports.CodeFile = CodeFile;
//# sourceMappingURL=index.js.map