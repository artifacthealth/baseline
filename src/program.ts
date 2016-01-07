/// <reference path="./types.d.ts" />
/// <reference path="../typings/commander.d.ts" />

import fs = require("fs");
import program = require("commander");
import glob = require("glob");
import path = require("path");

import Baseline = require("./baseline");

program
    .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version)
    .usage('[options] [files]')
    .option('-b, --baseline <file>', 'full path to file to use for baseline')
    .option('-c, --confidence <percent>', 'percent confidence for reporting changes from baseline [95]')
    .option('-m, --min-time <seconds>', 'minimum time a test runs in seconds [2]')
    .option('-O, --reporter-options <k=v,k2=v2,...>', 'reporter-specific options')
    .option('-R, --reporter <name>', 'specify the reporter to use')
    .option('-t, --timeout <ms>', 'set timeout in milliseconds [60000]')
    .option('-T, --threshold <percent>', 'minimum reported percent change from baseline [5]')
    .option('-u, --update', 'update baseline')
    .option('--colors', 'force enabling of colors')
    .option('--no-colors', 'force disabling of colors')
    .option('--recursive', 'include sub directories')
    .option('--reporters', 'display available reporters');

program.on('reporters', () => {
    console.log();
    console.log(' default - the default reporter');
    console.log(' minimal - only reports results for tests changed from baseline');
    console.log();
    process.exit();
});

program.parse(process.argv);

var baseline = new Baseline();

var extensions = ["js"];

var options: any = program;

if(options.baseline !== undefined) {
    baseline.baselinePath = options.baseline;
}

// --no-colors
if (options.colors === false) {
    baseline.useColors = false;
}

// --colors
if (~process.argv.indexOf('--colors') || ~process.argv.indexOf('-c')) {
    baseline.useColors = true;
}

if(options.timeout !== undefined) {
  baseline.timeout = options.timeout;
}

if(options.minTime !== undefined) {
    baseline.maxTime = options.minTime;
}

if(options.threshold !== undefined) {
    baseline.threshold = options.threshold;
}

if(options.confidence !== undefined) {
    baseline.confidence = options.confidence;
}

if(options.update !== undefined) {
    baseline.updateBaseline = options.update;
}

var args = program.args;
if(args.length == 0) {
    program.help();
    process.exit(0);
}

// get list of files
var files: string[] = [];
args.forEach(function(arg){
    files = files.concat(lookupFiles(arg, extensions, options.recursive));
});
baseline.files = files;

// reporter options
var reporterOptions: any = {};
if (options.reporterOptions !== undefined) {
    options.reporterOptions.split(",").forEach(function(opt: string) {
        var L = opt.split("=");
        if (L.length != 2) {
            throw new Error("invalid reporter option '" + opt + "'");
        }
        reporterOptions[L[0]] = L[1];
    });
}

// load reporter
if(options.reporter) {
    try {
        var Reporter = require(__dirname + '/reporters/' + options.reporter + "Reporter");
    } catch (err) {
        try {
            Reporter = require(options.reporter);
        } catch (err) {
            throw new Error('reporter "' + options.reporter + '" does not exist');
        }
    }
    baseline.reporter = new Reporter(reporterOptions);
}

baseline.run((err: Error, slower?: number) => {
    if(err) throw err;
    process.exit(slower || 0);
});

/**
 * Lookup file names at the given `path`.
 */
function lookupFiles(filePath: string, extensions: string[], recursive: boolean): string[] {
    var files: string[] = [];
    var re = new RegExp('\\.(' + extensions.join('|') + ')$');
    if (!fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + '.js')) {
            filePath += '.js';
        } else {
            files = glob.sync(filePath);
            if (!files.length) throw new Error("cannot resolve path (or pattern) '" + filePath + "'");
            return files;
        }
    }
    try {
        var stat = fs.statSync(filePath);
        if (stat.isFile()) return [filePath];
    }
    catch (ignored) {
        return;
    }
    fs.readdirSync(filePath).forEach(function(file) {
        file = path.join(filePath, file);
        try {
            var stat = fs.statSync(file);
            if (stat.isDirectory()) {
                if (recursive) {
                    files = files.concat(lookupFiles(file, extensions, recursive));
                }
                return;
            }
        }
        catch (ignored) {
            return;
        }
        if (!stat.isFile() || !re.test(file) || path.basename(file)[0] === '.') return;
        files.push(file);
    });
    return files;
}