/// <reference path="./types.d.ts" />

import fs = require("fs");
import Suite = require("./suite");
import Test = require("./test");

class Results {

    get timestamp(): Date {
        return this._results ? new Date(this._results.timestamp) : undefined;
    }

    private _results: SuiteResults;

    static fromSuite(suite: Suite): Results {

        var ret = new Results();
        ret._results = Results._getSuiteResults(suite);
        ret._results.timestamp = new Date().getTime()
        return ret;
    }

    static load(filename: string, callback: ResultCallback<Results>): void {

        Results._fileExists(filename, (exists) => {
            if(!exists) return callback();

            fs.readFile(filename, "utf8", (err: Error, data: string) => {
                if(err) return callback(err);

                var ret = new Results();
                ret._results = JSON.parse(data);
                if(ret._results.type === undefined) {
                    ret._results.type = "hz";
                }
                callback(null, ret);
            });
        });
    }

    private static _fileExists(filename: string, callback: (exists: boolean) => void): void {

        if(!filename) return callback(false);
        fs.exists(filename, callback);
    }

    save(filename: string, callback: Callback): void {

        fs.writeFile(filename, JSON.stringify(this._results, null, "  "), "utf8", callback);
    }

    getBaselineHz(test: Test): number {

        return this._findValue(this._getPath(test));
    }

    private _findValue(path: string[]): number {

        var results = this._results;
        for(var i = 0, l = path.length - 1; i < l; i++) {
            results = results.suites[path[i]];
            if(!results) {
                return;
            }
        }

        return results.tests[path[i]];
    }

    private _getPath(test: Test): string[] {

        var member: SuiteMember = test;
        var path: string[] = [];

        while(member) {
            if(member.parent) {
                path.push(member.title);
            }
            member = member.parent;
        }

        return path.reverse();
    }

    private static _getSuiteResults(suite: Suite): SuiteResults {

        var results: SuiteResults = {
            type: "sample"
        }

        if(suite.tests.length > 0) {
            results.tests = {};
            suite.tests.forEach(test => {
                if(!test.pending) {
                    results.tests[test.title] = 1 / (test.mean + test.moe);
                }
            });
        }

        if(suite.suites.length > 0) {
            results.suites = {};
            suite.suites.forEach(suite => {
                if(!suite.pending && !suite.compare) {
                    results.suites[suite.title] = Results._getSuiteResults(suite);
                }
            });
        }

        return results;
    }
}

interface SuiteResults {

    type?: string;
    timestamp?: number;
    tests?: Lookup<number>;
    suites?: Lookup<SuiteResults>;
}

interface SuiteMember {

    title: string;
    parent: Suite;
}

export = Results;