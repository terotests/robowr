#!/usr/bin/env node
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
var _1 = require("../writer/");
var argv = require('minimist')(process.argv.slice(2));
var readlineSync = require('readline-sync');
var rootPath = process.env.ROBOWR || process.cwd() + '/.robowr/';
var fs = require('fs');
console.log(argv);
var commands = [];
fs.readdirSync(rootPath).forEach(function (file) {
    var name = file.split('.')[0];
    var ext = file.split('.')[1];
    if (ext === 'js') {
        try {
            var cmd = require(rootPath + '/' + file);
            commands.push({
                name: name,
                short_doc: cmd.short_doc || '',
                long_doc: cmd.long_doc || '',
                init: cmd.init || {}
            });
        }
        catch (e) {
        }
    }
});
if (argv._.length < 1) {
    console.log('robowr <command>');
    var spaces_1 = function (s, len) {
        var res = s;
        var i = len - s.length;
        while (i-- > 0)
            res = res + ' ';
        return res;
    };
    commands.forEach(function (cmd) {
        console.log('  ', spaces_1(cmd.name, 15), cmd.short_doc || '');
    });
    process.exit();
}
// console.log(argv._)
// TODO: can you undo the ROBOWR operatorions ? 
// writing a lot of files can be a bit dangerous sometimes...
var outputDir = argv.o || argv.output || './robo_output/';
if (!outputDir) {
    console.log('robowr <commands> --o <outputdir>');
    console.log('Please give the output directory');
    process.exit();
}
// console.log(fs.readFileSync('/dev/stdin').toString());
var initData = {};
var readCommandData = function (CmdName) {
    try {
        console.log(process.cwd() + '/' + CmdName + '.json');
        var TryData = fs.readFileSync(process.cwd() + '/' + CmdName + '.json', 'utf8');
        var TryObj = JSON.parse(TryData);
        return TryObj;
    }
    catch (e) {
    }
    return {};
};
var _loop_1 = function (CmdName) {
    initData = __assign({}, initData, readCommandData(CmdName));
    var givenCmd = commands.filter(function (c) { return c.name === CmdName; }).pop();
    // initialize using the command 
    if (!givenCmd) {
        console.log('Invalid command', CmdName);
        process.exit();
    }
    else {
        initData = __assign({}, givenCmd.init, initData);
        for (var _i = 0, _a = Object.keys(initData); _i < _a.length; _i++) {
            var key = _a[_i];
            if (!initData[key]) {
                initData[key] = readlineSync.question(key + ' : ');
            }
        }
    }
};
// Initialize the command data
for (var _i = 0, _a = argv._; _i < _a.length; _i++) {
    var CmdName = _a[_i];
    _loop_1(CmdName);
}
// Finding the commands...
// try the commands...
var fileSystem = new _1.CodeFileSystem();
var rootFile = fileSystem.getFile('/', 'README.md');
var wr = rootFile.getWriter();
wr.setState(initData);
// run all the commands...
for (var _b = 0, _c = argv._; _b < _c.length; _b++) {
    var Name = _c[_b];
    console.log('Command ', Name);
    var ScriptFile = Name;
    var ScriptFunction = Name;
    var parts = Name.split('/');
    if (parts.length == 2) {
        ScriptFile = parts[0];
        ScriptFunction = parts[1];
    }
    var cmd = require(rootPath + '/' + ScriptFile);
    cmd[ScriptFunction](wr);
}
// Then save results...
fileSystem.saveTo(process.cwd() + '/' + (outputDir || ''));
// const writer = CodeWriter.withFS('')
//# sourceMappingURL=index.js.map