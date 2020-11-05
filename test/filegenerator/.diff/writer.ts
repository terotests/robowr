const fileWriterGenerator = () => [
  `// The application generator has a global state`,
  "",
  `import * as prettier from "prettier";`,
  `import * as immer from "immer";`,
  `import * as node_path from "path";`,
  "",
  `export function CreateContext<T>(data: T, rootFileName: string = "index.ts") {`,
  [
    [
      `const ctx = new Ctx<T>(data);`,
      `const fs = new CodeFileSystem();`,
      `ctx.writer = fs.getFile("./", rootFileName).getWriter();`,
      `return ctx;`
    ]
  ],
  `}`,
  "",
  `export interface hasWriter {`,
  [[`writer: CodeWriter;`, `newLine: boolean;`]],
  `}`,
  "",
  `export interface SaveOptions {`,
  [
    [
      `onlyIfNotExists?: boolean;`,
      `usePrettier?: boolean;`,
      `prettierConfig?: any;`,
      `useDiff?: boolean;`
    ]
  ],
  `}`,
  "",
  `export type generatorFunction<T extends hasWriter> = (x: T) => CodeBlock<T>;`,
  `export type CodeBlock<T extends hasWriter> =`,
  [
    [
      `| Array<CodeBlock<T>>`,
      `| generatorFunction<T>`,
      `| undefined`,
      `| void`,
      `| string;`
    ]
  ],
  "",
  `export function Join<T extends hasWriter>(list: CodeBlock<T>): CodeBlock<T> {`,
  [
    [
      `return (x: T) => {`,
      [
        [
          `const orig = x.newLine;`,
          `x.newLine = false;`,
          `Walk(x, list);`,
          `x.newLine = orig;`,
          `return "";`
        ]
      ],
      `};`
    ]
  ],
  `}`,
  `type CodeRow = string | Array<CodeRow>;`,
  `export function TextToArray(inputTxt: string) {`,
  [
    [
      `const lines = inputTxt.split("\n");`,
      `let outputIndex = 0;`,
      `const calculateTabIndex = (line: string = lines[outputIndex]) => {`,
      [
        [
          `if (line.trim().length === 0) {`,
          [[`return currentTabIndex;`]],
          `}`,
          `let cnt = 0;`,
          `for (let i = 0; i < line.length; i++) {`,
          [
            [
              `if (line[i].match(/\t/)) {`,
              [[`cnt += 2;`, `continue;`]],
              `}`,
              `if (line[i].match(/\s/)) {`,
              [[`cnt++;`]],
              `} else {`,
              [[`break;`]],
              `}`
            ]
          ],
          `}`,
          `return Math.floor(cnt / 2);`
        ]
      ],
      `};`,
      `let currentTabIndex = 0;`,
      `const consumeLines = () => {`,
      [
        [
          `const initialTabIndex = calculateTabIndex();`,
          `currentTabIndex = initialTabIndex;`,
          `const result: CodeRow = [];`,
          `while (outputIndex < lines.length && initialTabIndex <= currentTabIndex) {`,
          [
            [
              `const lineTxt = lines[outputIndex].trim();`,
              `if (lineTxt.trim().length === 0) {`,
              [[`result.push("");`]],
              `} else {`,
              [[`result.push(lineTxt);`]],
              `}`,
              `outputIndex++;`,
              `if (outputIndex >= lines.length) {`,
              [[`break;`]],
              `}`,
              `currentTabIndex = calculateTabIndex();`,
              `if (currentTabIndex > initialTabIndex) {`,
              [
                [
                  `result.push([consumeLines()]);`,
                  `if (currentTabIndex < initialTabIndex) {`,
                  [[`break;`]],
                  `}`
                ]
              ],
              `}`
            ]
          ],
          `}`,
          `return result;`
        ]
      ],
      `};`,
      `return consumeLines();`
    ]
  ],
  `}`,
  "",
  `export function TextGenerator(`,
  [
    [
      `inputTxt: string,`,
      `lineFn: (line: string, index: number, lines: string[]) => string = (s) => s`
    ]
  ],
  `) {`,
  [
    [
      `const lines = inputTxt.split("\n");`,
      `let lastTabIndex = 0;`,
      `let outputIndex = 0;`,
      `const calculateTabIndex = (line: string = lines[outputIndex]) => {`,
      [
        [
          `let cnt = 0;`,
          `for (let i = 0; i < line.length; i++) {`,
          [
            [
              `if (line[i].match(/\t/)) {`,
              [[`cnt += 2;`, `continue;`]],
              `}`,
              `if (line[i].match(/\s/)) {`,
              [[`cnt++;`]],
              `} else {`,
              [[`break;`]],
              `}`
            ]
          ],
          `}`,
          `return Math.floor(cnt / 2);`
        ]
      ],
      `};`,
      `let currentTabIndex = 0;`,
      `const consumeLines = () => {`,
      [
        [
          `const initialTabIndex = calculateTabIndex();`,
          `currentTabIndex = initialTabIndex;`,
          `const result: CodeBlock<any> = [];`,
          `while (outputIndex < lines.length && initialTabIndex <= currentTabIndex) {`,
          [
            [
              `const lineTxt = lineFn(lines[outputIndex], outputIndex, lines).trim();`
            ]
          ]
        ]
      ]
    ]
  ],
  "",
  [
    [
      `if (lineTxt.trim().length === 0) {`,
      [[`result.push("'',");`]],
      `} else {`,
      [
        [
          `result.push(`,
          [
            [
              `"\`" +`,
              [
                [
                  `lineTxt`,
                  [
                    [
                      `.split("\`")`,
                      `.join("\\\`")`,
                      `.split("\$")`,
                      `.join("\\\$") +`
                    ]
                  ],
                  `"\`,"`
                ]
              ]
            ]
          ],
          `);`
        ]
      ],
      `}`,
      `outputIndex++;`,
      `if (outputIndex >= lines.length) {`,
      [[`break;`]],
      `}`,
      `currentTabIndex = calculateTabIndex();`,
      `if (currentTabIndex > initialTabIndex) {`,
      [
        [
          `result.push("[[");`,
          `result.push([consumeLines()]);`,
          `result.push("]],");`,
          `if (currentTabIndex < initialTabIndex) {`,
          [[`break;`]],
          `}`
        ]
      ],
      `}`
    ]
  ],
  `}`,
  [[`return result;`]],
  `};`,
  [[`return [\`[\`, consumeLines(), "]"];`]],
  `}`,
  "",
  `export class Ctx<T extends {}> {`,
  [
    [
      `writer: CodeWriter;`,
      `newLine = true;`,
      `parent?: Ctx<T>;`,
      `data: T;`,
      `constructor(data: T = null) {`,
      [[`this.data = data;`]],
      `}`,
      `fork() {`,
      [
        [
          `const n = new Ctx<T>(this.data);`,
          `n.writer = this.writer;`,
          `n.parent = this;`,
          `return n;`
        ]
      ],
      `}`,
      `produce(fn: (data: T) => void) {`,
      [[`this.data = immer.produce(this.data, fn);`]],
      `}`,
      `file(path: string, filename: string, tag?: string) {`,
      [
        [
          `const forked = this.fork();`,
          `forked.writer = forked.writer.getFileWriter(path, filename);`,
          `if (tag) {`,
          [[`forked.writer = forked.writer.tag(tag);`]],
          `}`,
          `return forked;`
        ]
      ],
      `}`,
      `write(code: CodeBlock<Ctx<T>>) {`,
      [[`Walk(this, code);`, `return this;`]],
      `}`,
      `save(path: string, options?: boolean | SaveOptions) {`,
      [
        [
          `let opts: SaveOptions = {};`,
          `if (typeof options === "boolean") {`,
          [[`opts.usePrettier = options;`]],
          `}`,
          `if (typeof options === "undefined") {`,
          [[`opts.usePrettier = true;`]],
          `}`,
          `if (typeof options === "object") {`,
          [
            [
              `opts = { ...options };`,
              `opts.usePrettier =`,
              [
                [
                  `typeof options.usePrettier === "undefined" ? true : options.usePrettier;`
                ]
              ]
            ]
          ],
          `}`,
          `opts.useDiff = typeof opts.useDiff === "undefined" ? true : opts.useDiff;`,
          `this.writer.getFilesystem().saveTo(path, opts);`,
          `return this;`
        ]
      ],
      `}`
    ]
  ],
  `}`,
  "",
  `/**`,
  `*`,
  `* @param ctx generic context of T to use`,
  `* @param lines lines to be generated`,
  `*/`,
  `export function Walk<T extends hasWriter>(ctx: T, lines: CodeBlock<T>) {`,
  [
    [
      `if (!ctx.writer) {`,
      [[`return ctx;`]],
      `}`,
      `const wr = ctx.writer;`,
      `if (typeof lines === "undefined") {`,
      [[`return ctx;`]],
      `}`
    ]
  ],
  "",
  [
    [
      `if (typeof lines === "string") {`,
      [[`wr.out(lines, ctx.newLine);`, `return ctx;`]],
      `}`
    ]
  ],
  "",
  [
    [
      `if (typeof lines === "function") {`,
      [[`const value = lines(ctx);`, `Walk(ctx, value);`, `return ctx;`]],
      `}`
    ]
  ],
  "",
  [[`if (lines.length === 0) {`, [[`return ctx;`]], `}`]],
  "",
  [
    [
      `// if the first is array, we have block indent`,
      `if (lines[0] instanceof Array && lines.length === 1) {`,
      [
        [
          `const unwrap = (wrappedList: CodeBlock<T>) => {`,
          [
            [
              `if (wrappedList instanceof Array && wrappedList.length === 1) {`,
              [[`return unwrap(wrappedList[0]);`]],
              `}`,
              `return wrappedList;`
            ]
          ],
          `};`,
          `wr.indent(1);`,
          `Walk(ctx, unwrap(lines));`,
          `wr.indent(-1);`,
          `return ctx;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [[`for (const line of lines) {`, [[`Walk(ctx, line);`]], `}`, `return ctx;`]],
  `}`,
  "",
  `export class CodeSlice {`,
  [[`code: string = "";`, `writer: CodeWriter;`]],
  "",
  [
    [
      `getCode(): string {`,
      [
        [`if (!this.writer) return this.code;`, `return this.writer.getCode();`]
      ],
      `}`
    ]
  ],
  `}`,
  "",
  `export type WriterFn = (wr: CodeWriter) => void;`,
  "",
  `export class CodeSliceFn extends CodeSlice {`,
  [[`code: string = "";`, `writer: CodeWriter;`, `fn: WriterFn;`]],
  "",
  [[`getCode(): string {`, [[`if (!this.writer || !this.fn) return "";`]]]],
  "",
  [
    [
      `const localWriter = new CodeWriter();`,
      `localWriter.parent = this.writer;`,
      `localWriter.fs = this.writer.getFilesystem();`
    ]
  ],
  "",
  [[`this.fn(localWriter);`, `return localWriter.getCode();`]],
  `}`,
  `}`,
  "",
  `export class CodeWriter {`,
  [
    [
      `ownerFile: CodeFile;`,
      `tagName: string = "";`,
      `codeStr: string = "";`,
      `currentLine: string = "";`,
      `tabStr: string = "  ";`,
      `nlStr = "\n";`,
      `lineNumber: number = 1;`,
      `_indentAmount: number = 0;`
    ]
  ],
  "",
  [[`compiledTags: { [key: string]: boolean } = {};`]],
  "",
  [[`// Code Writer Tags...`, `tags: { [key: string]: CodeWriter } = {};`]],
  "",
  [
    [
      `slices: CodeSlice[] = [];`,
      `current_slice: CodeSlice;`,
      `forks: CodeWriter[];`
    ]
  ],
  "",
  [[`tagOffset: number = 0;`, `parent: CodeWriter;`, `fs: CodeFileSystem;`]],
  "",
  [[`had_nl = true;`]],
  "",
  [[`state = {};`]],
  "",
  [
    [
      `constructor() {`,
      [
        [
          `const new_slice = new CodeSlice();`,
          `this.slices.push(new_slice);`,
          `this.current_slice = new_slice;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [[`fn(fn: WriterFn): CodeWriter {`, [[`const position = this.fork();`]]]],
  "",
  [
    [
      `const new_writer = new CodeWriter();`,
      `const new_slice = new CodeSliceFn();`,
      `new_slice.fn = fn;`,
      `new_slice.writer = position;`,
      `position.fs = this.getFilesystem();`
    ]
  ],
  "",
  [
    [
      `new_writer.parent = this;`,
      `new_writer._indentAmount = this._indentAmount;`
    ]
  ],
  "",
  [[`this.slices.push(new_slice);`]],
  "",
  [
    [
      `const new_active_slice = new CodeSlice();`,
      `this.slices.push(new_active_slice);`,
      `this.current_slice = new_active_slice;`,
      `return this;`
    ]
  ],
  `}`,
  "",
  [
    [
      `walk<T>(code: CodeBlock<Ctx<T>>, ctx?: Ctx<T>) {`,
      [
        [
          `if (ctx) {`,
          [[`ctx.writer = this;`, `Walk(ctx, code);`]],
          `} else {`,
          [
            [
              `const ctx = new Ctx(null);`,
              `ctx.writer = this;`,
              `Walk(ctx, code);`
            ]
          ],
          `}`,
          `return this;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `setState(...objs: any[]) {`,
      [
        [
          `for (let obj of objs) {`,
          [
            [
              `this.getFilesystem().state = { ...this.getFilesystem().state, ...obj };`
            ]
          ],
          `}`
        ]
      ],
      `}`
    ]
  ],
  "",
  [[`getState(): any {`, [[`return this.getFilesystem().state;`]], `}`]],
  "",
  [
    [
      `getFilesystem(): CodeFileSystem {`,
      [
        [
          `if (this.fs) return this.fs;`,
          `if (!this.ownerFile) {`,
          [
            [
              `if (!this.parent) {`,
              [[`return this.parent.getFilesystem();`]],
              `}`,
              `throw "The Writer has no filesystem assigned";`
            ]
          ],
          `}`,
          `if (!this.ownerFile.fileSystem)`,
          [[`throw "The Writer has no filesystem assigned";`]],
          `return this.ownerFile.fileSystem;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `findFile(path: string, fileName: string): CodeFile {`,
      [
        [
          `if (!this.fs && !this.ownerFile) {`,
          [
            [
              `if (this.parent) return this.parent.findFile(path, fileName);`,
              `throw "getFileWriter: no filesystem defined for the writer";`
            ]
          ],
          `}`,
          `const fs = this.fs || this.ownerFile.fileSystem;`,
          `return fs.getFile(path, fileName);`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `getFileWriter(path: string, fileName: string): CodeWriter {`,
      [
        [
          `if (!this.fs && !this.ownerFile) {`,
          [
            [
              `if (this.parent) return this.parent.getFileWriter(path, fileName);`,
              `throw "getFileWriter: no filesystem defined for the writer";`
            ]
          ],
          `}`,
          `const fs = this.fs || this.ownerFile.fileSystem;`,
          `const file = fs.getFile(path, fileName);`,
          `const wr = file.getWriter();`,
          `return wr;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `static withFS(path: string, fileName: string): CodeWriter {`,
      [[`return new CodeFileSystem().getFile(path, fileName).getWriter();`]],
      `}`
    ]
  ],
  "",
  [
    [
      `static emptyWithFS(): CodeWriter {`,
      [
        [
          `const wr = new CodeWriter();`,
          `const file = new CodeFile(".", "emptyFile.txt");`,
          `file.writer = wr;`,
          `file.fileSystem = new CodeFileSystem();`,
          `wr.ownerFile = file;`,
          `return wr;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [[`createTag(tag: string) {}`]],
  "",
  [
    [
      `// replacte all the contents of the file with this data...`,
      `rewrite(str: string) {}`
    ]
  ],
  "",
  [
    [
      `indent(delta: number): CodeWriter {`,
      [
        [
          `this._indentAmount = this._indentAmount + delta;`,
          `if (this._indentAmount < 0) {`,
          [[`this._indentAmount = 0;`]],
          `}`,
          `return this;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `addIndent() {`,
      [
        [
          `let i = 0;`,
          `if (0 == this.currentLine.length) {`,
          [
            [
              `while (i < this._indentAmount) {`,
              [
                [
                  `this.currentLine = this.currentLine + this.tabStr;`,
                  `i = i + 1;`
                ]
              ],
              `}`
            ]
          ],
          `}`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `findTag(name: string): CodeWriter {`,
      [
        [
          `if (this.tags[name]) return this.tags[name];`,
          `if (this.parent) this.parent.findTag(name);`,
          `return null;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `// creates a tagged writer at this position...`,
      `tag(name: string): CodeWriter {`,
      [[`const had = this.findTag(name);`, `if (had) return had;`]]
    ]
  ],
  "",
  [
    [
      `const new_writer = new CodeWriter();`,
      `const new_slice = new CodeSlice();`,
      `new_slice.writer = new_writer;`,
      `new_writer.parent = this; // connects to the file system`,
      `new_writer._indentAmount = this._indentAmount;`
    ]
  ],
  "",
  [
    [
      `// current slice should be also saved`,
      `if (this.currentLine.length > 0) {`,
      [
        [
          `this.current_slice.code = this.currentLine;`,
          `this.currentLine = "";`
        ]
      ],
      `}`
    ]
  ],
  "",
  [[`this.tags[name] = new_writer;`, `this.slices.push(new_slice);`]],
  "",
  [
    [
      `const new_active_slice = new CodeSlice();`,
      `this.slices.push(new_active_slice);`,
      `this.current_slice = new_active_slice;`,
      `return new_writer;`
    ]
  ],
  `}`,
  "",
  [
    [
      `// creates a new fork position for the code writing...`,
      `fork(): CodeWriter {`,
      [
        [
          `const new_writer = new CodeWriter();`,
          `const new_slice = new CodeSlice();`,
          `new_slice.writer = new_writer;`,
          `new_writer.parent = this;`,
          `new_writer._indentAmount = this._indentAmount;`
        ]
      ]
    ]
  ],
  "",
  [
    [
      `// current slice should be also saved`,
      `if (this.currentLine.length > 0) {`,
      [
        [
          `this.current_slice.code = this.currentLine;`,
          `this.currentLine = "";`
        ]
      ],
      `}`
    ]
  ],
  "",
  [[`this.slices.push(new_slice);`]],
  "",
  [
    [
      `const new_active_slice = new CodeSlice();`,
      `this.slices.push(new_active_slice);`,
      `this.current_slice = new_active_slice;`,
      `return new_writer;`
    ]
  ],
  `}`,
  "",
  [
    [
      `pushSlice() {`,
      [
        [
          `this.current_slice.code = this.current_slice.code + this.currentLine;`,
          `this.currentLine = "";`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `newline(): CodeWriter {`,
      [
        [
          `if (this.currentLine.length > 0) {`,
          [[`this.out("", true);`]],
          `}`,
          `return this;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `writeSlice(str: string, newLine: boolean) {`,
      [
        [
          `this.addIndent();`,
          `this.currentLine = this.currentLine + str;`,
          `if (newLine) {`,
          [
            [
              `this.current_slice.code =`,
              [[`this.current_slice.code + this.currentLine + this.nlStr;`]],
              `this.currentLine = "";`
            ]
          ],
          `}`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `out(str: string, newLine: boolean = false): CodeWriter {`,
      [
        [
          `const lines: string[] = str.split("\n"); // (strsplit str "\n")`,
          `const rowCnt = lines.length;`,
          `if (rowCnt == 1) {`,
          [[`this.writeSlice(str, newLine);`]],
          `} else {`,
          [
            [
              `for (let i = 0; i < lines.length; i++) {`,
              [
                [
                  `const row = lines[i];`,
                  `this.addIndent();`,
                  `if (i < rowCnt - 1) {`,
                  [[`this.writeSlice(row.trim(), true);`]],
                  `} else {`,
                  [[`this.writeSlice(row, newLine);`]],
                  `}`
                ]
              ],
              `}`
            ]
          ],
          `}`,
          `return this;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `raw(str: string, newLine: boolean = false): CodeWriter {`,
      [
        [
          `const lines: string[] = str.split("\n");`,
          `const rowCnt = lines.length;`,
          `if (rowCnt == 1) {`,
          [[`this.writeSlice(str, newLine);`]],
          `} else {`,
          [
            [
              `for (let i = 0; i < lines.length; i++) {`,
              [
                [
                  `const row = lines[i];`,
                  `this.addIndent();`,
                  `if (i < rowCnt - 1) {`,
                  [[`this.writeSlice(row, true);`]],
                  `} else {`,
                  [[`this.writeSlice(row, newLine);`]],
                  `}`
                ]
              ],
              `}`
            ]
          ],
          `}`,
          `return this;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `getCode(`,
      [
        [
          `asFileName?: string,`,
          `usePrettier: boolean = false,`,
          `prettierConfig?: any`
        ]
      ],
      `): string {`,
      [
        [
          `if (usePrettier && asFileName)`,
          [[`return this.prettier(asFileName, prettierConfig);`]],
          `let res = "";`,
          `for (let slice of this.slices) {`,
          [[`res = res + slice.getCode();`]],
          `}`,
          `res = res + this.currentLine;`,
          `return res;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `prettier(asFileName: string, prettierConfig?: any): string {`,
      [
        [
          `const path = require("path");`,
          `const data = this.getCode();`,
          `switch (path.extname(asFileName)) {`,
          [
            [
              `case ".ts":`,
              `case ".tsx":`,
              [
                [
                  `return prettier.format(data, {`,
                  [
                    [
                      `...prettierConfig,`,
                      `...{ semi: true, parser: "typescript" },`
                    ]
                  ],
                  `});`
                ]
              ],
              `case ".js":`,
              [
                [
                  `return prettier.format(data, {`,
                  [
                    [
                      `...prettierConfig,`,
                      `...{ semi: true, parser: "babylon" },`
                    ]
                  ],
                  `});`
                ]
              ],
              `case ".graphql":`,
              `case ".gql":`,
              [
                [
                  `return prettier.format(data, {`,
                  [
                    [
                      `...prettierConfig,`,
                      `...{ semi: true, parser: "graphql" },`
                    ]
                  ],
                  `});`
                ]
              ],
              `case ".md":`,
              [
                [
                  `return prettier.format(data, {`,
                  [
                    [
                      `...prettierConfig,`,
                      `...{ semi: true, parser: "markdown" },`
                    ]
                  ],
                  `});`
                ]
              ],
              `case ".scss":`,
              [
                [
                  `return prettier.format(data, {`,
                  [[`...prettierConfig,`, `...{ parser: "scss" },`]],
                  `});`
                ]
              ],
              `case ".scss":`,
              [
                [
                  `return prettier.format(data, {`,
                  [[`...prettierConfig,`, `...{ parser: "scss" },`]],
                  `});`
                ]
              ],
              `case ".json":`,
              [
                [
                  `return prettier.format(data, {`,
                  [[`...prettierConfig,`, `...{ parser: "json" },`]],
                  `});`
                ]
              ]
            ]
          ],
          `}`,
          `return data;`
        ]
      ],
      `}`
    ]
  ],
  `}`,
  "",
  `export class CodeFileSystem {`,
  [[`files: CodeFile[] = [];`, `state = {};`]],
  "",
  [
    [
      `getFile(path: string, name: string): CodeFile {`,
      [
        [
          `for (let file of this.files) {`,
          [[`if (file.path_name === path && file.name === name) return file;`]],
          `}`,
          `const new_file = new CodeFile(path, name);`,
          `new_file.fileSystem = this;`,
          `this.files.push(new_file);`,
          `return new_file;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `hasTagStart(str: string, tag: string, index: number): boolean {`,
      [
        [
          `let i = 0;`,
          `let len = tag.length;`,
          `while (len > 0) {`,
          [
            [
              `if (str.charAt(index + i) !== tag.charAt(i)) return false;`,
              `len--;`,
              `i++;`
            ]
          ],
          `}`,
          `return true;`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `readTagName(str: string, index: number): string {`,
      [
        [
          `let name = "";`,
          `let i = 0;`,
          `let max_len = str.length;`,
          `while (index + i < max_len) {`,
          [
            [
              `if (str.charAt(index + i) == ")") {`,
              [[`return str.substring(index, index + i);`]],
              `}`,
              `i++;`
            ]
          ],
          `}`,
          `return "";`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `// tagstart can be like tag#...`,
      `openTaggedFile(`,
      [
        [
          `path: string,`,
          `name: string,`,
          `tagStart: string,`,
          `tagEnd: string`
        ]
      ],
      `): CodeFile {`,
      [
        [
          `for (let file of this.files) {`,
          [[`if (file.path_name === path && file.name === name) return file;`]],
          `}`
        ]
      ]
    ]
  ],
  "",
  [
    [
      `const data = require("fs").readFileSync(path + name, "utf8");`,
      `const slices = [];`,
      `let last_i = 0;`
    ]
  ],
  "",
  [
    [
      `const wr = new CodeWriter();`,
      `for (let i = 0; i < data.length; i++) {`,
      [
        [
          `// like //tag`,
          `if (this.hasTagStart(data, tagStart, i)) {`,
          [
            [
              `const tagName = this.readTagName(data, i + tagStart.length + 1);`,
              `if (tagName) {`,
              [
                [
                  `i = i + tagStart.length + tagName.length + 2;`,
                  `let start_index = i;`,
                  `let end_index = i;`,
                  `// The position where to insert the code...`,
                  `for (let a = i; a < data.length; a++) {`,
                  [
                    [
                      `if (this.hasTagStart(data, tagEnd, a)) {`,
                      [[`end_index = a;`, `break;`]],
                      `}`
                    ]
                  ],
                  `}`,
                  `if (end_index > start_index) {`,
                  [
                    [
                      `wr.raw(data.substring(last_i, start_index), false);`,
                      `wr.pushSlice();`,
                      `wr.tag(tagName);`,
                      `i = end_index + tagEnd.length;`,
                      `last_i = end_index;`
                    ]
                  ],
                  `}`
                ]
              ],
              `}`
            ]
          ],
          `}`
        ]
      ],
      `}`,
      `wr.raw(data.substring(last_i), false);`,
      `const new_file = new CodeFile(path, name);`,
      `new_file.fileSystem = this;`,
      `this.files.push(new_file);`,
      `new_file.writer = wr;`,
      `return new_file;`
    ]
  ],
  `}`,
  "",
  [
    [
      `mkdir(path: string) {`,
      [
        [
          `const fs = require("fs");`,
          `const parts: string[] = path.split("/");`,
          `let curr_path = "";`,
          `for (let p of parts) {`,
          [
            [
              `curr_path = curr_path + p + "/";`,
              `if (!fs.existsSync(curr_path)) {`,
              [[`fs.mkdirSync(curr_path);`]],
              `}`
            ]
          ],
          `}`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `// onlyIfNotExists = write files only if the do exist`,
      `async saveTo(root_path: string, options: SaveOptions = {}) {`,
      [
        [
          `const fs = require("fs");`,
          `const path = require("path");`,
          `for (let file of this.files) {`,
          [
            [
              `const file_path = root_path + "/" + file.path_name;`,
              `let data = file.getCode(options.usePrettier, options.prettierConfig);`,
              `if (data.length > 0) {`,
              [
                [
                  `this.mkdir(file_path);`,
                  `const path = file_path + "/" + file.name.trim();`,
                  `if (options.useDiff) {`,
                  [
                    [
                      `const diff_path = file_path + "/.diff/";`,
                      `this.mkdir(diff_path);`,
                      `const diff_file = diff_path + file.name.trim();`,
                      `if (fs.existsSync(diff_file)) {`,
                      [
                        [
                          `const diffCode = fs.readFileSync(diff_file, "utf8");`,
                          `const origCode = fs.readFileSync(path, "utf8");`,
                          `// if the code is equal, replace`,
                          `if (diffCode === origCode) {`,
                          [
                            [
                              `// no changes since the last write`,
                              `fs.writeFileSync(diff_file, data);`,
                              `fs.writeFileSync(path, data);`
                            ]
                          ],
                          `} else {`,
                          [
                            [
                              `function AreEqual(`,
                              [
                                [
                                  `generated: CodeRow,`,
                                  `current: CodeRow,`,
                                  `prev?: CodeRow`
                                ]
                              ],
                              `) {`,
                              [
                                [
                                  `if (prev) {`,
                                  [
                                    [
                                      `if (JSON.stringify(current) === JSON.stringify(prev)) {`,
                                      [[`return true;`]],
                                      `}`
                                    ]
                                  ],
                                  `}`,
                                  `if (typeof generated === typeof current) {`,
                                  [
                                    [
                                      `if (generated instanceof Array) {`,
                                      [[`return true;`]],
                                      `}`,
                                      `return generated === current;`
                                    ]
                                  ],
                                  `}`,
                                  `return false;`
                                ]
                              ],
                              `}`
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    ]
  ],
  "",
  [
    [
      `// , prevGenerated: CodeRow)`,
      `function GetValue(`,
      [[`generated: CodeRow,`, `current: CodeRow,`, `prev?: CodeRow`]],
      `) {`,
      [
        [
          `if (typeof generated === typeof current) {`,
          [
            [
              `if (generated instanceof Array) {`,
              [
                [
                  `const prevArr = prev instanceof Array ? prev : undefined;`,
                  `return WalkCode(generated, current as CodeRow[], prevArr);`
                ]
              ],
              `}`,
              `return generated;`
            ]
          ],
          `}`,
          `return "";`
        ]
      ],
      `}`,
      `function WalkCode(`,
      [
        [
          `generated: CodeRow[],`,
          `current: CodeRow[],`,
          `prevGenerated?: CodeRow[]`
        ]
      ],
      `) {`,
      [
        [
          `let ci = 0;`,
          `let i = 0;`,
          `let pci = 0;`,
          `const output: CodeRow = [];`,
          `if (prevGenerated) {`,
          [
            [
              `if (`,
              [[`JSON.stringify(prevGenerated) === JSON.stringify(current)`]],
              `) {`,
              [[`return generated;`]],
              `}`
            ]
          ],
          `}`,
          `while (ci < current.length) {`,
          [
            [
              `if (AreEqual(generated[i], current[ci], prevGenerated[pci])) {`,
              [
                [
                  `const prevArr =`,
                  [
                    [
                      `prevGenerated instanceof Array`,
                      [[`? prevGenerated`, `: undefined;`]]
                    ]
                  ],
                  `output.push(`,
                  [[`GetValue(generated[i], current[ci], prevGenerated[pci])`]],
                  `);`,
                  `ci++;`,
                  `i++;`,
                  `pci++;`,
                  `continue;`
                ]
              ],
              `}`,
              `output.push(current[ci]);`,
              `ci++;`
            ]
          ],
          `}`,
          `return output;`
        ]
      ],
      `}`,
      `const codeBlock = WalkCode(`,
      [
        [
          `TextToArray(data),`,
          `TextToArray(fs.readFileSync(path, "utf8")),`,
          `TextToArray(diffCode)`
        ]
      ],
      `);`,
      `const ctx = CreateContext({})`,
      [[`.file("./", file.name.trim())`, `.write(codeBlock);`]],
      `const codeText = ctx.writer.getCode(file.name.trim(), true);`,
      `fs.writeFileSync(diff_file, data); // the code generator wants to write`,
      `fs.writeFileSync(path, codeText);`
    ]
  ],
  `}`,
  [
    [
      `} else {`,
      [
        [
          `// write the file`,
          `fs.writeFileSync(diff_file, data);`,
          `fs.writeFileSync(path, data);`
        ]
      ],
      `}`
    ]
  ],
  `} else {`,
  [
    [
      `if (!options.onlyIfNotExists || !fs.existsSync(path)) {`,
      [[`fs.writeFileSync(path, data);`]],
      `}`
    ]
  ],
  `}`,
  [[`}`]],
  `}`,
  [[`}`]],
  `}`,
  "",
  `export class CodeFile {`,
  [[`path_name: string = "";`, `name: string = "";`, `writer: CodeWriter;`]],
  "",
  [[`import_list: { [key: string]: string };`, `fileSystem: CodeFileSystem;`]],
  "",
  [
    [
      `constructor(filePath: string, fileName: string) {`,
      [
        [
          `this.name = fileName;`,
          `this.path_name = filePath;`,
          `this.writer = new CodeWriter();`,
          `this.writer.createTag("imports");`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [
      `addImport(import_name: string) {`,
      [
        [
          `if (!this.import_list[import_name]) {`,
          [[`this.import_list[import_name] = import_name;`]],
          `}`
        ]
      ],
      `}`
    ]
  ],
  "",
  [
    [`rewrite(newString: string) {`, [[`this.writer.rewrite(newString);`]], `}`]
  ],
  "",
  [
    [
      `getImports(): string[] {`,
      [[`return Object.keys(this.import_list);`]],
      `}`
    ]
  ],
  "",
  [
    [
      `getWriter(): CodeWriter {`,
      [[`this.writer.ownerFile = this;`, `return this.writer;`]],
      `}`
    ]
  ],
  "",
  [
    [
      `getCode(usePrettier: boolean = false, prettierConfig?: any): string {`,
      [[`return this.writer.getCode(this.name, usePrettier, prettierConfig);`]],
      `}`
    ]
  ],
  `}`,
  ""
];
