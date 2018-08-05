"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.indentAmount = 0;
        this.compiledTags = {};
        // Code Writer Tags...
        this.tags = {};
        this.slices = [];
        this.tagOffset = 0;
        this.had_nl = true;
        var new_slice = new CodeSlice();
        this.slices.push(new_slice);
        this.current_slice = new_slice;
    }
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
        this.indentAmount = this.indentAmount + delta;
        if (this.indentAmount < 0) {
            this.indentAmount = 0;
        }
        return this;
    };
    CodeWriter.prototype.addIndent = function () {
        var i = 0;
        if (0 == this.currentLine.length) {
            while (i < this.indentAmount) {
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
        new_writer.indentAmount = this.indentAmount;
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
        new_writer.indentAmount = this.indentAmount;
        this.slices.push(new_slice);
        var new_active_slice = new CodeSlice();
        this.slices.push(new_active_slice);
        this.current_slice = new_active_slice;
        return new_writer;
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
                    this.writeSlice(row.trim(), true);
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