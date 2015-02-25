/*!
 * The code for '_compareTests' is a modified version of code
 * originally from Benchmark.js. Original Copyright follows.
 *
 * Benchmark.js v2.0.0-pre <http://benchmarkjs.com/>
 * Copyright 2010-2015 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */

/// <reference path="./types.d.ts" />

import async = require("async");
import Evaluator = require("./evaluator");
import Reporter = require("./reporters/reporter");
import Suite = require("./suite");
import Test = require("./test");
import Runnable = require("./runnable");
import NodeTimer = require("./nodeTimer");
import DefaultReporter = require("./reporters/defaultReporter");
import Results = require("./results");

class Runner {

    /**
     * The minimum percent difference from baseline that is reported as a change.
     */
    threshold = 10;

    private _evaluator: Evaluator;
    private _reporter: Reporter;
    private _baseline: Results;
    private _slower = 0;

    constructor(reporter?: Reporter, evaluator?: Evaluator, baseline?: Results) {

        this._reporter = reporter || new DefaultReporter();
        this._evaluator = evaluator || new Evaluator(new NodeTimer(), this._reporter);
        this._baseline = baseline;
    }

    run(suite: Suite, callback: ResultCallback<number>): void {

        this._reporter.start(this._baseline ? this._baseline.timestamp : undefined);

        this._runSuite(suite, (err: Error) => {
            if(err) return callback(err);

            this._reporter.end();
            callback(null, this._slower);
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

                if(suite.compare) {
                    this._compareTests(suite);
                }

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

        if(suite.pending || test.pending) {
            this._reporter.pending(test);
            process.nextTick(callback);
            return;
        }

        this._reporter.testStart(test);

        // execute "beforeEach" hooks
        async.eachSeries(suite.beforeEach, (action: Runnable, done: Callback) => action.run(done), (err: Error) => {
            if (err) return callback(err);

            // evaluate the test
            this._evaluator.evaluate(test, (err: Error) => {
                if (err) return callback(err);

                // execute "afterEach" hooks
                async.eachSeries(suite.afterEach, (action: Runnable, done: Callback) => action.run(done), (err: Error) => {
                    if(err) return callback(err);

                    if(this._baseline) {
                        var hz = this._getHz(test),
                            baselineHz = this._baseline.getBaselineHz(test),
                            percentChange: number;
                    }

                    if(baselineHz) {
                        percentChange = ((hz - baselineHz) / baselineHz) * 100;
                        if(!isFinite(percentChange) || Math.abs(percentChange) < this.threshold) {
                            percentChange = undefined;
                        }
                        else {
                            if(percentChange < 0) {
                                this._slower++;
                            }
                        }
                    }

                    this._reporter.testEnd(test, percentChange);
                    callback();
                });
            });
        });
    }

    private _compareTests(suite: Suite): void {

        var tests = suite.filter('successful'),
            fastest = suite.filter('fastest'),
            slowest = suite.filter('slowest');

        var fastestHz = this._getHz(fastest[0]);

        tests.forEach((test: Test) => {

            var hz = this._getHz(test),
                percentSlower = (1 - (hz / fastestHz)) * 100,
                rank = 0;

            if(fastest.indexOf(test) !== -1) {
                rank = 1;
            }
            else {
                if(slowest.indexOf(test) !== -1) {
                    rank = -1;
                }
            }

            this._reporter.rank(test, rank, rank !== 1 && isFinite(hz) ? percentSlower : undefined);
        });
    }

    /**
     * Gets the Hz, i.e. operations per second, of `test` adjusted for the margin of error.
     * @param test The test.
     */
    private _getHz(test: Test) {
        return 1 / (test.mean + test.moe);
    }
}

export = Runner;