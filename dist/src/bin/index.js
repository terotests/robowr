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
var commands = [];
fs.readdirSync(rootPath).forEach(function (file) {
    var name = file.split('.')[0];
    var ext = file.split('.')[1];
    if (ext === 'js') {
        try {
            var cmd_1 = require(rootPath + '/' + file);
            commands.push({
                name: name,
                short_doc: cmd_1.short_doc || '',
                long_doc: cmd_1.long_doc || '',
                init: cmd_1.init || {}
            });
        }
        catch (e) {
        }
    }
});
if (argv._.length < 1) {
    console.log('robowr <command> <outputdir>');
    commands.forEach(function (cmd) {
        console.log('  ', cmd.name, '   ', cmd.short_doc || '');
    });
    process.exit();
}
if (argv._.length < 2) {
    console.log('robowr <command> <outputdir>');
    console.log('Please give the output directory');
    process.exit();
}
// console.log(fs.readFileSync('/dev/stdin').toString());
var initData = {};
try {
    console.log(process.cwd() + '/' + argv._[0] + '.json');
    var TryData = fs.readFileSync(process.cwd() + '/' + argv._[0] + '.json', 'utf8');
    var TryObj = JSON.parse(TryData);
    initData = __assign({}, initData, TryObj);
}
catch (e) {
}
if (argv._.length >= 1) {
    var cmd_2 = argv._[0];
    var givenCmd = commands.filter(function (c) { return c.name === cmd_2; }).pop();
    if (!givenCmd) {
        console.log('Invalid command', cmd_2);
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
}
// Finding the commands...
// try the command...
var Name = argv._[0];
var ScriptFile = Name;
var ScriptFunction = Name;
var parts = Name.split('/');
if (parts.length == 2) {
    ScriptFile = parts[0];
    ScriptFunction = parts[1];
}
var cmd = require(rootPath + '/' + argv._[0]);
var fileSystem = new _1.CodeFileSystem();
// get data for the command...
// and then output files to the directory...
// create file...
var rootFile = fileSystem.getFile('/', 'README.md');
// (new CodeFileSystem).getFile(path, fileName).getWriter()
var wr = rootFile.getWriter();
wr.setState(initData);
// Run command for the writer
cmd[ScriptFunction](wr);
// Then save results...
fileSystem.saveTo(process.cwd() + '/' + (argv._[1] || ''));
// const writer = CodeWriter.withFS('')
//# sourceMappingURL=index.js.map