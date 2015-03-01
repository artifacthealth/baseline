/// <reference path="./types.d.ts" />
/// <reference path="../typings/node.d.ts" />
/// <reference path="../typings/glob.d.ts"/>
/// <reference path="../typings/async.d.ts"/>

import vm = require("vm");
import fs = require("fs");
import async = require("async");
import glob = require("glob");
import path = require("path");

import Suite = require("./suite");
import Test = require("./test");
import Reporter = require("./reporters/reporter");
import Evaluator = require("./evaluator");
import NodeTimer = require("./nodeTimer");
import Runner = require("./runner");
import DefaultReporter = require("./reporters/defaultReporter");
import MinimalReporter = require("./reporters/minimalReporter");
import Results = require("./results");

class Baseline {

    /**
     * A list of files to load. Glob patterns are allowed.
     */
    files: string[];

    /**
     * The Reporter to use.
     */
    reporter: Reporter;

    /**
     * The minimum percent difference from baseline that is reported as a change.
     */
    threshold = 10;

    /**
     * The maximum time a test is allowed to run, in seconds, before finishing
     */
    maxTime = 2;

    /**
     * Maximum execution time for an asynchronous action, in milliseconds.
     */
    timeout: number;

    /**
     * Full path to file to use for baseline.
     */
    baselinePath: string;

    /**
     * Indicates whether or not the baseline should be updated.
     */
    updateBaseline = false;

    /**
     * Indicates whether or not to use colors in reporter. If undefined, colors are used if supported.
     * in the terminal.
     */
    useColors: boolean;

    /**
     * The root suite. Top level suites contained in 'files' are added to the root suite.
     */
    private _suite: Suite;

    run(callback: ResultCallback<number>): void {

        this._suite = new Suite();
        this._loadFiles();

        Results.load(this.baselinePath, (err: Error, baseline?: Results) => {
            if(err) return callback(err);

            var reporter = this.reporter || new DefaultReporter();
            reporter.useColors = this.useColors;

            var evaluator = new Evaluator(new NodeTimer(), reporter);
            evaluator.maxTime = this.maxTime;

            var runner = new Runner(reporter, evaluator, baseline);
            runner.threshold = this.threshold;

            runner.run(this._suite, (err: Error, slower?: number) => {
                if(err) return callback(err);

                if((!baseline || this.updateBaseline) && this.baselinePath) {
                    Results.fromSuite(this._suite).save(this.baselinePath, (err: Error) => {
                        if (err) return callback(err);
                        callback(null, slower);
                    });
                    return;
                }

                callback(null, slower);
            });
        });
    }

    private _loadFiles(): void {

        this.files.forEach(searchPath => {
            glob.sync(searchPath).forEach(match => {

                this._createGlobals(global);
                require(path.resolve(match));
            });
        });
    }

    private _createGlobals(context: any): void {

        var suites = [this._suite];

        context.suite = (title: string, block: () => void): Suite => {

            var suite = new Suite(title);
            suites[0].addSuite(suite);

            suites.unshift(suite);
            block.call(suite);
            suites.shift();

            return suite;
        }

        context.suite.skip = (title: string, block: () => void): Suite => {
            var suite = context.suite(title, block);
            suite.pending = true;
            return suite;
        }

        context.compare = (title: string, block: () => void): Suite => {
            var suite = context.suite(title, block);
            suite.compare = true;
            return suite;
        }

        context.compare.skip = (title: string, block: () => void): Suite => {
            var suite = context.suite.skip(title, block);
            suite.compare = true;
            return suite;
        }

        context.test = (title: string, action: ActionCallback): Test => {
            var test = new Test(title, action);
            suites[0].addTest(test);
            test.timeout = this.timeout;
            return test;
        }

        context.test.skip = (title: string, action: ActionCallback): Test => {
            var test = global.test(title, action);
            test.pending = true;
            return test;
        }

        context.after = (action: ActionCallback): void => {
            suites[0].addAfter(action);
        }

        context.before = (action: ActionCallback): void => {
            suites[0].addBefore(action);
        }

        context.afterEach = (action: ActionCallback): void => {
            suites[0].addAfterEach(action);
        }

        context.beforeEach = (action: ActionCallback): void => {
            suites[0].addBeforeEach(action);
        }
    }

    static DefaultReporter = DefaultReporter;
    static MinimalReporter = MinimalReporter;
}

export = Baseline;