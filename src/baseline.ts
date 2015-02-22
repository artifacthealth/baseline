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
import Reporter = require("./reporter");
import Evaluator = require("./evaluator");
import NodeTimer = require("./nodeTimer");
import Runner = require("./runner");

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
     * The maximum time a test is allowed to run, in seconds, before finishing
     */
    maxTime = 2;

    /**
     * Maximum execution time for an asynchronous action, in milliseconds.
     */
    timeout: number;

    /**
     * The root suite. Top level suites contained in 'files' are added to the root suite.
     */
    private _suite: Suite;

    run(callback: Callback): void {

        this._suite = new Suite();
        this._loadFiles();

        var evaluator = new Evaluator(new NodeTimer());
        evaluator.maxTime = this.maxTime;

        var runner = new Runner(this.reporter, evaluator);
        runner.run(this._suite, callback);
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
            suite.skip = true;
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
            test.skip = true;
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
}

export = Baseline;