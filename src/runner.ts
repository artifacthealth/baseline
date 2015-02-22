/// <reference path="./types.d.ts" />

import async = require("async");
import Evaluator = require("./evaluator");
import Reporter = require("./reporter");
import Suite = require("./suite");
import Test = require("./test");
import Runnable = require("./runnable");
import NodeTimer = require("./nodeTimer");
import StdoutReporter = require("./stdoutReporter")

class Runner {

    private _evaluator: Evaluator;
    private _reporter: Reporter;

    constructor(reporter?: Reporter, evaluator?: Evaluator) {

        this._evaluator = evaluator || new Evaluator(new NodeTimer());
        this._reporter = reporter || new StdoutReporter();
    }

    run(suite: Suite, callback: Callback): void {

        this._reporter.start();

        this._runSuite(suite, (err: Error) => {
            if(err) return callback(err);

            this._reporter.end();
            callback();
        });
    }

    private _runSuite(suite: Suite, callback: Callback): void {

        this._reporter.suiteStart(suite);

        // execute "before" hooks
        async.eachSeries(suite.before, (action: Runnable, done: Callback) => action.run(done), (err: Error) => {
            if(err) return callback(err);

            // for each test
            async.eachSeries(suite.tests, (test: Test, done: Callback) => this._runTest(suite, test, done), (err) => {
                if(err) return callback(err);

                // execute any other suites
                async.eachSeries(suite.suites, (suite: Suite, done: Callback) => this._runSuite(suite, done), (err) => {
                    if (err) return callback(err);

                    // execute "after" hooks
                    async.eachSeries(suite.after, (action: Runnable, done: Callback) => action.run(done), (err: Error) => {
                        if (err) return callback(err);

                        this._reporter.suiteEnd(suite);
                        callback();
                    });
                });
            });
        });
    }

    private _runTest(suite: Suite, test: Test, callback: Callback): void {

        if(suite.skip || test.skip) {
            this._reporter.skip(test);
            process.nextTick(callback);
            return;
        }

        this._reporter.testStart(test);

        // execute "beforeEach" hooks
        async.eachSeries(suite.beforeEach, (action: Runnable, done: Callback) => action.run(done), (err: Error) => {
            if (err) return callback(err);

            // evaluate the test
            this._evaluator.evaluate(test, (err) => {
                if (err) return callback(err);

                // execute "afterEach" hooks
                async.eachSeries(suite.afterEach, (action: Runnable, done: Callback) => action.run(done), (err: Error) => {
                    if(err) return callback(err);

                    this._reporter.testEnd(test);
                    callback();
                });
            });
        });
    }
}

export = Runner;