"use strict";
// The application generator has a global state
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prettier = require("prettier");
function Join(list) {
    return (x) => {
        const orig = x.newLine;
        x.newLine = false;
        Walk(x, list);
        x.newLine = orig;
        return "";
    };
}
exports.Join = Join;
class Ctx {
    constructor() {
        this.newLine = true;
    }
    fork() {
        const n = new Ctx();
        n.writer = this.writer;
        n.parent = this;
        n.data = {};
        return n;
    }
}
exports.Ctx = Ctx;
/**
 *
 * @param ctx generic context of T to use
 * @param lines lines to be generated
 */
function Walk(ctx, lines) {
    if (!ctx.writer) {
        return;
    }
    const wr = ctx.writer;
    if (typeof lines === "undefined") {
        return;
    }
    if (typeof lines === "string") {
        wr.out(lines, ctx.newLine);
        return;
    }
    if (typeof lines === "function") {
        const value = lines(ctx);
        Walk(ctx, value);
        return;
    }
    if (lines.length === 0) {
        return;
    }
    // if the first is array, we have block indent
    if (lines[0] instanceof Array && lines.length === 1) {
        const unwrap = (wrappedList) => {
            if (wrappedList instanceof Array && wrappedList.length === 1) {
                return unwrap(wrappedList[0]);
            }
            return wrappedList;
        };
        wr.indent(1);
        Walk(ctx, unwrap(lines));
        wr.indent(-1);
        return;
    }
    for (const line of lines) {
        Walk(ctx, line);
    }
}
exports.Walk = Walk;
class CodeSlice {
    constructor() {
        this.code = "";
    }
    getCode() {
        if (!this.writer)
            return this.code;
        return this.writer.getCode();
    }
}
exports.CodeSlice = CodeSlice;
class CodeSliceFn extends CodeSlice {
    constructor() {
        super(...arguments);
        this.code = "";
    }
    getCode() {
        if (!this.writer || !this.fn)
            return "";
        const localWriter = new CodeWriter();
        localWriter.parent = this.writer;
        localWriter.fs = this.writer.getFilesystem();
        this.fn(localWriter);
        return localWriter.getCode();
    }
}
exports.CodeSliceFn = CodeSliceFn;
class CodeWriter {
    constructor() {
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
        const new_slice = new CodeSlice();
        this.slices.push(new_slice);
        this.current_slice = new_slice;
    }
    fn(fn) {
        const position = this.fork();
        const new_writer = new CodeWriter();
        const new_slice = new CodeSliceFn();
        new_slice.fn = fn;
        new_slice.writer = position;
        position.fs = this.getFilesystem();
        new_writer.parent = this;
        new_writer._indentAmount = this._indentAmount;
        this.slices.push(new_slice);
        const new_active_slice = new CodeSlice();
        this.slices.push(new_active_slice);
        this.current_slice = new_active_slice;
        return this;
    }
    setState(...objs) {
        for (let obj of objs) {
            this.getFilesystem().state = Object.assign(Object.assign({}, this.fs.state), obj);
        }
    }
    getState() {
        return this.getFilesystem().state;
    }
    getFilesystem() {
        if (this.fs)
            return this.fs;
        if (!this.ownerFile) {
            if (!this.parent) {
                return this.parent.getFilesystem();
            }
            throw "The Writer has no filesystem assigned";
        }
        if (!this.ownerFile.fileSystem)
            throw "The Writer has no filesystem assigned";
        return this.ownerFile.fileSystem;
    }
    findFile(path, fileName) {
        if (!this.fs && !this.ownerFile) {
            if (this.parent)
                return this.parent.findFile(path, fileName);
            throw "getFileWriter: no filesystem defined for the writer";
        }
        const fs = this.fs || this.ownerFile.fileSystem;
        return fs.getFile(path, fileName);
    }
    getFileWriter(path, fileName) {
        if (!this.fs && !this.ownerFile) {
            if (this.parent)
                return this.parent.getFileWriter(path, fileName);
            throw "getFileWriter: no filesystem defined for the writer";
        }
        const fs = this.fs || this.ownerFile.fileSystem;
        const file = fs.getFile(path, fileName);
        const wr = file.getWriter();
        return wr;
    }
    static withFS(path, fileName) {
        return new CodeFileSystem().getFile(path, fileName).getWriter();
    }
    static emptyWithFS() {
        const wr = new CodeWriter();
        const file = new CodeFile(".", "emptyFile.txt");
        file.writer = wr;
        file.fileSystem = new CodeFileSystem();
        wr.ownerFile = file;
        return wr;
    }
    createTag(tag) { }
    // replacte all the contents of the file with this data...
    rewrite(str) { }
    indent(delta) {
        this._indentAmount = this._indentAmount + delta;
        if (this._indentAmount < 0) {
            this._indentAmount = 0;
        }
        return this;
    }
    addIndent() {
        let i = 0;
        if (0 == this.currentLine.length) {
            while (i < this._indentAmount) {
                this.currentLine = this.currentLine + this.tabStr;
                i = i + 1;
            }
        }
    }
    findTag(name) {
        if (this.tags[name])
            return this.tags[name];
        if (this.parent)
            this.parent.findTag(name);
        return null;
    }
    // creates a tagged writer at this position...
    tag(name) {
        const had = this.findTag(name);
        if (had)
            return had;
        const new_writer = new CodeWriter();
        const new_slice = new CodeSlice();
        new_slice.writer = new_writer;
        new_writer.parent = this; // connects to the file system
        new_writer._indentAmount = this._indentAmount;
        // current slice should be also saved
        if (this.currentLine.length > 0) {
            this.current_slice.code = this.currentLine;
            this.currentLine = "";
        }
        this.tags[name] = new_writer;
        this.slices.push(new_slice);
        const new_active_slice = new CodeSlice();
        this.slices.push(new_active_slice);
        this.current_slice = new_active_slice;
        return new_writer;
    }
    // creates a new fork position for the code writing...
    fork() {
        const new_writer = new CodeWriter();
        const new_slice = new CodeSlice();
        new_slice.writer = new_writer;
        new_writer.parent = this;
        new_writer._indentAmount = this._indentAmount;
        // current slice should be also saved
        if (this.currentLine.length > 0) {
            this.current_slice.code = this.currentLine;
            this.currentLine = "";
        }
        this.slices.push(new_slice);
        const new_active_slice = new CodeSlice();
        this.slices.push(new_active_slice);
        this.current_slice = new_active_slice;
        return new_writer;
    }
    pushSlice() {
        this.current_slice.code = this.current_slice.code + this.currentLine;
        this.currentLine = "";
    }
    newline() {
        if (this.currentLine.length > 0) {
            this.out("", true);
        }
        return this;
    }
    writeSlice(str, newLine) {
        this.addIndent();
        this.currentLine = this.currentLine + str;
        if (newLine) {
            this.current_slice.code =
                this.current_slice.code + this.currentLine + this.nlStr;
            this.currentLine = "";
        }
    }
    out(str, newLine = false) {
        const lines = str.split("\n"); // (strsplit str "\n")
        const rowCnt = lines.length;
        if (rowCnt == 1) {
            this.writeSlice(str, newLine);
        }
        else {
            for (let i = 0; i < lines.length; i++) {
                const row = lines[i];
                this.addIndent();
                if (i < rowCnt - 1) {
                    this.writeSlice(row.trim(), true);
                }
                else {
                    this.writeSlice(row, newLine);
                }
            }
        }
        return this;
    }
    raw(str, newLine = false) {
        const lines = str.split("\n");
        const rowCnt = lines.length;
        if (rowCnt == 1) {
            this.writeSlice(str, newLine);
        }
        else {
            for (let i = 0; i < lines.length; i++) {
                const row = lines[i];
                this.addIndent();
                if (i < rowCnt - 1) {
                    this.writeSlice(row, true);
                }
                else {
                    this.writeSlice(row, newLine);
                }
            }
        }
        return this;
    }
    getCode(asFileName, usePrettier = false, prettierConfig) {
        if (usePrettier && asFileName)
            return this.prettier(asFileName, prettierConfig);
        let res = "";
        for (let slice of this.slices) {
            res = res + slice.getCode();
        }
        res = res + this.currentLine;
        return res;
    }
    prettier(asFileName, prettierConfig) {
        const path = require("path");
        const data = this.getCode();
        switch (path.extname(asFileName)) {
            case ".ts":
            case ".tsx":
                return prettier.format(data, Object.assign(Object.assign({}, prettierConfig), { semi: true, parser: "typescript" }));
            case ".js":
                return prettier.format(data, Object.assign(Object.assign({}, prettierConfig), { semi: true, parser: "babylon" }));
            case ".graphql":
            case ".gql":
                return prettier.format(data, Object.assign(Object.assign({}, prettierConfig), { semi: true, parser: "graphql" }));
            case ".md":
                return prettier.format(data, Object.assign(Object.assign({}, prettierConfig), { semi: true, parser: "markdown" }));
            case ".scss":
                return prettier.format(data, Object.assign(Object.assign({}, prettierConfig), { parser: "scss" }));
            case ".scss":
                return prettier.format(data, Object.assign(Object.assign({}, prettierConfig), { parser: "scss" }));
            case ".json":
                return prettier.format(data, Object.assign(Object.assign({}, prettierConfig), { parser: "json" }));
        }
        return data;
    }
}
exports.CodeWriter = CodeWriter;
class CodeFileSystem {
    constructor() {
        this.files = [];
        this.state = {};
    }
    getFile(path, name) {
        for (let file of this.files) {
            if (file.path_name === path && file.name === name)
                return file;
        }
        const new_file = new CodeFile(path, name);
        new_file.fileSystem = this;
        this.files.push(new_file);
        return new_file;
    }
    hasTagStart(str, tag, index) {
        let i = 0;
        let len = tag.length;
        while (len > 0) {
            if (str.charAt(index + i) !== tag.charAt(i))
                return false;
            len--;
            i++;
        }
        return true;
    }
    readTagName(str, index) {
        let name = "";
        let i = 0;
        let max_len = str.length;
        while (index + i < max_len) {
            if (str.charAt(index + i) == ")") {
                return str.substring(index, index + i);
            }
            i++;
        }
        return "";
    }
    // tagstart can be like tag#...
    openTaggedFile(path, name, tagStart, tagEnd) {
        for (let file of this.files) {
            if (file.path_name === path && file.name === name)
                return file;
        }
        const data = require("fs").readFileSync(path + name, "utf8");
        const slices = [];
        let last_i = 0;
        const wr = new CodeWriter();
        for (let i = 0; i < data.length; i++) {
            // like //tag
            if (this.hasTagStart(data, tagStart, i)) {
                const tagName = this.readTagName(data, i + tagStart.length + 1);
                if (tagName) {
                    i = i + tagStart.length + tagName.length + 2;
                    let start_index = i;
                    let end_index = i;
                    // The position where to insert the code...
                    for (let a = i; a < data.length; a++) {
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
        const new_file = new CodeFile(path, name);
        new_file.fileSystem = this;
        this.files.push(new_file);
        new_file.writer = wr;
        return new_file;
    }
    mkdir(path) {
        const fs = require("fs");
        const parts = path.split("/");
        let curr_path = "";
        for (let p of parts) {
            curr_path = curr_path + p + "/";
            if (!fs.existsSync(curr_path)) {
                fs.mkdirSync(curr_path);
            }
        }
    }
    // onlyIfNotExists = write files only if the do exist
    saveTo(root_path, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const fs = require("fs");
            const path = require("path");
            for (let file of this.files) {
                const file_path = root_path + "/" + file.path_name;
                this.mkdir(file_path);
                let data = file.getCode(options.usePrettier, options.prettierConfig);
                if (data.length > 0) {
                    const path = file_path + "/" + file.name.trim();
                    if (!options.onlyIfNotExists || !fs.existsSync(path)) {
                        fs.writeFileSync(path, data);
                    }
                }
            }
        });
    }
}
exports.CodeFileSystem = CodeFileSystem;
class CodeFile {
    constructor(filePath, fileName) {
        this.path_name = "";
        this.name = "";
        this.name = fileName;
        this.path_name = filePath;
        this.writer = new CodeWriter();
        this.writer.createTag("imports");
    }
    addImport(import_name) {
        if (!this.import_list[import_name]) {
            this.import_list[import_name] = import_name;
        }
    }
    rewrite(newString) {
        this.writer.rewrite(newString);
    }
    getImports() {
        return Object.keys(this.import_list);
    }
    getWriter() {
        this.writer.ownerFile = this;
        return this.writer;
    }
    getCode(usePrettier = false, prettierConfig) {
        return this.writer.getCode(this.name, usePrettier, prettierConfig);
    }
}
exports.CodeFile = CodeFile;
//# sourceMappingURL=index.js.map