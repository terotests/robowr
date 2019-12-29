export interface hasWriter {
    writer: CodeWriter;
    newLine: boolean;
}
export declare type generatorFunction<T extends hasWriter> = (x: T) => CodeBlock<T>;
export declare type CodeBlock<T extends hasWriter> = Array<CodeBlock<T>> | generatorFunction<T> | undefined | void | string;
export declare function Join<T extends hasWriter>(list: CodeBlock<T>): CodeBlock<T>;
export declare class Ctx<T extends {}> {
    writer: CodeWriter;
    newLine: boolean;
    parent?: Ctx<T>;
    data?: Partial<T>;
    fork(): Ctx<T>;
}
/**
 *
 * @param ctx generic context of T to use
 * @param lines lines to be generated
 */
export declare function Walk<T extends hasWriter>(ctx: T, lines: CodeBlock<T>): void;
export declare class CodeSlice {
    code: string;
    writer: CodeWriter;
    getCode(): string;
}
export declare type WriterFn = (wr: CodeWriter) => void;
export declare class CodeSliceFn extends CodeSlice {
    code: string;
    writer: CodeWriter;
    fn: WriterFn;
    getCode(): string;
}
export declare class CodeWriter {
    ownerFile: CodeFile;
    tagName: string;
    codeStr: string;
    currentLine: string;
    tabStr: string;
    nlStr: string;
    lineNumber: number;
    _indentAmount: number;
    compiledTags: {
        [key: string]: boolean;
    };
    tags: {
        [key: string]: CodeWriter;
    };
    slices: CodeSlice[];
    current_slice: CodeSlice;
    forks: CodeWriter[];
    tagOffset: number;
    parent: CodeWriter;
    fs: CodeFileSystem;
    had_nl: boolean;
    state: {};
    constructor();
    fn(fn: WriterFn): CodeWriter;
    setState(...objs: any[]): void;
    getState(): any;
    getFilesystem(): CodeFileSystem;
    findFile(path: string, fileName: string): CodeFile;
    getFileWriter(path: string, fileName: string): CodeWriter;
    static withFS(path: string, fileName: string): CodeWriter;
    static emptyWithFS(): CodeWriter;
    createTag(tag: string): void;
    rewrite(str: string): void;
    indent(delta: number): CodeWriter;
    addIndent(): void;
    findTag(name: string): CodeWriter;
    tag(name: string): CodeWriter;
    fork(): CodeWriter;
    pushSlice(): void;
    newline(): CodeWriter;
    writeSlice(str: string, newLine: boolean): void;
    out(str: string, newLine?: boolean): CodeWriter;
    raw(str: string, newLine?: boolean): CodeWriter;
    getCode(asFileName?: string, usePrettier?: boolean, prettierConfig?: any): string;
    prettier(asFileName: string, prettierConfig?: any): string;
}
export declare class CodeFileSystem {
    files: CodeFile[];
    state: {};
    getFile(path: string, name: string): CodeFile;
    hasTagStart(str: string, tag: string, index: number): boolean;
    readTagName(str: string, index: number): string;
    openTaggedFile(path: string, name: string, tagStart: string, tagEnd: string): CodeFile;
    mkdir(path: string): void;
    saveTo(root_path: string, options?: {
        onlyIfNotExists?: boolean;
        usePrettier?: boolean;
        prettierConfig?: any;
    }): Promise<void>;
}
export declare class CodeFile {
    path_name: string;
    name: string;
    writer: CodeWriter;
    import_list: {
        [key: string]: string;
    };
    fileSystem: CodeFileSystem;
    constructor(filePath: string, fileName: string);
    addImport(import_name: string): void;
    rewrite(newString: string): void;
    getImports(): string[];
    getWriter(): CodeWriter;
    getCode(usePrettier?: boolean, prettierConfig?: any): string;
}
