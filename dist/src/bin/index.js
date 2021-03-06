#!/usr/bin/env node
"use strict";
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
const writer_1 = require("../writer/");
const R = require("../writer/");
function run_writer() {
    return __awaiter(this, void 0, void 0, function* () {
        const argv = require("minimist")(process.argv.slice(2));
        var readlineSync = require("readline-sync");
        const fs = require("fs");
        const path = require("path");
        if (!argv.f) {
            let hadData = false;
            process.stdin.on("end", function () {
                if (!hadData) {
                    process.exit();
                }
            });
            var stdinput = fs.readFileSync(0, "utf-8");
            hadData = true;
            if (stdinput.length > 0) {
                try {
                    const outputFile = argv.o || "generator.ts";
                    const dirName = path.dirname(outputFile);
                    const fileName = path.basename(outputFile);
                    const ctx = R.CreateContext({})
                        .file("/", "test")
                        .write([
                        'import * as R from "robowr"',
                        `R.CreateContext({}).file("${dirName}", "${fileName}").write(`,
                        R.TextGenerator(stdinput),
                        ').save("./")',
                    ]);
                    process.stdout.write(ctx.writer.getCode());
                }
                catch (e) {
                    console.error(e);
                }
                process.exit();
            }
        }
        if (argv.f) {
            try {
                const dirNameInput = path.dirname(argv.f);
                const fileNameInput = path.basename(argv.f);
                const outputFile = argv.o || dirNameInput + "/gen_" + fileNameInput + ".ts";
                const dirName = path.dirname(outputFile);
                const fileName = path.basename(outputFile);
                R.CreateContext({})
                    .file(dirName, fileName)
                    .write([
                    'import * as R from "robowr"',
                    `R.CreateContext({}).file("${dirNameInput}", "gen-${fileNameInput}").write(`,
                    R.TextGenerator(fs.readFileSync(argv.f, "utf8")),
                    ').save("./")',
                ])
                    .save("./");
                console.log("created ", outputFile);
            }
            catch (e) {
                console.error(e);
            }
            process.exit();
        }
        const LegacyInterface = () => __awaiter(this, void 0, void 0, function* () {
            const outputDir = argv.o || argv.output;
            if (!outputDir) {
                console.log("robowr <commands> --o <outputdir> --m <message>");
                console.log("Please give the output directory");
                process.exit();
            }
            const targetDir = process.cwd() + "/" + (outputDir || "");
            const normalizePath = (item) => {
                return path.normalize(targetDir + "/" + (item.path || item.path_name) + "/" + item.name.trim());
            };
            let simpleGit = null;
            try {
                simpleGit = require("simple-git/promise")(targetDir);
            }
            catch (e) { }
            const is_git = simpleGit && (yield simpleGit.checkIsRepo());
            let commands = [];
            const find_cmd = (name) => {
                return commands.filter((c) => c.name === name).pop();
            };
            const find_commands = (rootPath) => {
                try {
                    fs.readdirSync(rootPath).forEach((file) => {
                        const name = file.split(".")[0];
                        const ext = file.split(".")[1];
                        console.log(file);
                        if (find_cmd(name))
                            return;
                        if (ext === "js") {
                            try {
                                const cmd = require(rootPath + "/" + file);
                                commands.push({
                                    name,
                                    order: cmd.order || argv._.indexOf(name),
                                    require_path: rootPath + "/" + file,
                                    short_doc: cmd.short_doc || "",
                                    long_doc: cmd.long_doc || "",
                                    init: cmd.init || {},
                                });
                            }
                            catch (e) {
                                console.error(e);
                                console.log("Could not require command" + name + " from file");
                            }
                        }
                    });
                }
                catch (e) { }
            };
            find_commands(path.normalize(process.cwd() + "/" + outputDir + "/.robowr/cmds/"));
            if (argv.a) {
                commands.forEach((c) => {
                    if (argv._.indexOf(c.name) < 0) {
                        argv._.push(c.name);
                    }
                });
            }
            find_commands(process.cwd() + "/.robowr/cmds/");
            if (argv.a) {
                commands.forEach((c) => {
                    if (argv._.indexOf(c.name) < 0) {
                        argv._.push(c.name);
                    }
                });
            }
            else {
                commands = commands.filter((c) => {
                    return argv._.indexOf(c.name) >= 0;
                });
            }
            commands.sort((a, b) => a.order - b.order);
            console.log("Commands");
            console.log(commands);
            // Filter not present commands...
            // if(process.env.ROBOWR) find_commands(process.env.ROBOWR)
            if (argv._.length < 1) {
                console.log("robowr <command>");
                const spaces = (s, len) => {
                    let res = s;
                    let i = len - s.length;
                    while (i-- > 0)
                        res = res + " ";
                    return res;
                };
                commands.forEach((cmd) => {
                    console.log("  ", spaces(cmd.name, 15), cmd.short_doc || "");
                });
                process.exit();
            }
            // console.log(argv._)
            // TODO: can you undo the ROBOWR operatorions ?
            // writing a lot of files can be a bit dangerous sometimes...
            const commitMsg = argv.m || argv.message || "robowr";
            if (!commitMsg) {
                console.log("robowr <commands> --m <message>  --m <message>");
                console.log("Please give the commit message");
                process.exit();
            }
            // console.log(fs.readFileSync('/dev/stdin').toString());
            let initData = {};
            const data_files = [];
            const readCommandData = (CmdName) => {
                const extensions = ["json", "xml"];
                for (let ext of extensions) {
                    // try from .robowr subdirectory
                    let parser = (data) => JSON.parse(data);
                    try {
                        const TryData = fs.readFileSync(process.cwd() + "/.robowr/data/" + CmdName + "." + ext, "utf8");
                        const TryObj = parser(TryData);
                        const c = find_cmd(CmdName);
                        c.initData = TryObj;
                        return TryObj;
                    }
                    catch (e) { }
                    // try from current directory with file having the same name
                    try {
                        const TryData = fs.readFileSync(process.cwd() + "/" + CmdName + "." + ext, "utf8");
                        const TryObj = parser(TryData);
                        const c = find_cmd(CmdName);
                        c.initData = TryObj;
                        return TryObj;
                    }
                    catch (e) { }
                }
                const c = find_cmd(CmdName);
                if (!c) {
                    throw "Invalid Command " + CmdName;
                }
                c.initData = {};
                return {};
            };
            // Initilize Commands
            for (let givenCmd of commands) {
                // initialize the command data into the current nodes
                initData = Object.assign(Object.assign(Object.assign({}, initData), givenCmd.init), readCommandData(givenCmd.name));
            }
            for (let key of Object.keys(initData)) {
                if (!initData[key]) {
                    initData[key] = readlineSync.question(key + " : ");
                }
            }
            const save_data = () => __awaiter(this, void 0, void 0, function* () {
                const fileSystem = new writer_1.CodeFileSystem();
                const wr = new writer_1.CodeWriter();
                wr.fs = fileSystem;
                // const rootFile = fileSystem.getFile('/', '.');
                // const wr = rootFile.getWriter()
                wr.setState(initData);
                const write_history = [];
                const all_cmds = [];
                // run all the commands...
                for (let command of commands) {
                    all_cmds.push(command.name);
                    let file_i = fileSystem.files.length;
                    const cmd = require(command.require_path);
                    // read the source
                    const cmd_src = fs.readFileSync(command.require_path, "utf8");
                    const cmd_wr = wr.getFileWriter(".robowr/cmds/", command.name + ".js");
                    cmd_wr.raw(cmd_src);
                    // the model could also be in XML format...
                    const cmd_data_wr = wr.getFileWriter(".robowr/data/", command.name + ".json");
                    cmd_data_wr.raw(JSON.stringify(command.initData, null, 2));
                    cmd.run(wr);
                    // first pass
                    const file_cnt1 = fileSystem.files.length;
                    while (file_i < file_cnt1) {
                        const f = fileSystem.files[file_i];
                        // console.log('command ', Name, normalizePath( f ))
                        write_history.push({
                            cmd: command.name,
                            path: f.path_name,
                            name: f.name,
                            data: f.getCode(),
                            filesys: f,
                        });
                        file_i++;
                    }
                    // second pass, new files could be created by writers...
                    const file_cnt2 = fileSystem.files.length;
                    while (file_i < file_cnt2) {
                        const f = fileSystem.files[file_i];
                        write_history.push({
                            cmd: command.name,
                            path: f.path_name,
                            name: f.name,
                            data: f.getCode(),
                            filesys: f,
                        });
                        file_i++;
                    }
                }
                write_history.forEach((c) => {
                    c.data = c.filesys.getCode();
                    delete c.filesys;
                });
                // TODO: check which commands are enabled and then update the filesystem
                // accordingly by removing the files which are missing and not written using
                // the current command set...
                let prevWriteHistory = null;
                try {
                    prevWriteHistory = JSON.parse(fs.readFileSync(targetDir + "/.robowr/writes/history.json", "utf8"));
                }
                catch (e) { }
                const newList = [];
                const this_cmd_list = [];
                if (prevWriteHistory) {
                    for (let old of prevWriteHistory) {
                        // if the command is in the list of possible commands...
                        const had = all_cmds.filter((command) => command === old.cmd).pop();
                        if (had) {
                            this_cmd_list.push(old);
                        }
                        else {
                            newList.push(old);
                        }
                    }
                }
                // save only new files into directory
                yield fileSystem.saveTo(targetDir, { onlyIfNotExists: true });
                let had_changes = false;
                const processed = {};
                for (let old_file of this_cmd_list) {
                    //
                    const the_path = normalizePath(old_file);
                    const curr_file = write_history
                        .filter((v) => normalizePath(v) === normalizePath(old_file))
                        .pop();
                    /*
                  if(fs.existsSync(the_path)) {
                    const current_data = fs.readFileSync( the_path, 'utf8')
                    if(current_data != old_file.data ) {
                      // If there is data which is not same as previously...
                      console.log(`WARNING, file ${the_path} was modified by user, skipping`)
                      continue
                    }
                  }
                  */
                    if (!curr_file) {
                        // if the file has been removed...
                        console.log(`removed : ${normalizePath(old_file)}`);
                        had_changes = true;
                        if (is_git) {
                            yield simpleGit.rm(normalizePath(old_file));
                        }
                        else {
                            fs.unlinkSync(normalizePath(old_file));
                        }
                    }
                    else {
                        newList.push(curr_file);
                        processed[normalizePath(old_file)] = true;
                        if (old_file.data !== curr_file.data) {
                            had_changes = true;
                            if (is_git)
                                yield simpleGit.add(normalizePath(old_file));
                            console.log(`changed : ${normalizePath(old_file)}`);
                        }
                    }
                }
                for (let new_file of write_history) {
                    const the_path = normalizePath(new_file);
                    if (!processed[normalizePath(new_file)]) {
                        /*
                      if(fs.existsSync(the_path)) {
                        console.log(`WARNING, file ${the_path} was already created by the user, can not re-create.`)
                        continue
                      }
                      */
                        had_changes = true;
                        newList.push(new_file);
                        console.log(`added : ${normalizePath(new_file)}`);
                        if (is_git)
                            yield simpleGit.add(normalizePath(new_file));
                    }
                }
                // TODO: write the history of the files...
                const writeHistory = JSON.stringify(newList, null, 2);
                wr.getFileWriter(".robowr/writes/", "history.json").raw(writeHistory);
                // write again...
                yield fileSystem.saveTo(targetDir);
                // save and get versioned files...
                if (is_git && had_changes) {
                    yield simpleGit.add(targetDir + "/.robowr/writes/history.json");
                    yield simpleGit.commit(commitMsg);
                    yield simpleGit.push();
                    console.log("*** pushed to git ***");
                }
                if (!had_changes) {
                    console.log("Nothing changed.");
                }
                // The Branch checkout is disabled for now.
                // restore to the current branch
                /*
              if(is_git && (current_branch !== new_branch)) {
                await simpleGit.checkout( current_branch )
              }
              */
            });
            save_data();
        });
        if (argv.legacy) {
            LegacyInterface();
        }
    });
}
run_writer();
//# sourceMappingURL=index.js.map