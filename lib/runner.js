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
var async = require("async");
var Evaluator = require("./evaluator");
var NodeTimer = require("./nodeTimer");
var DefaultReporter = require("./reporters/defaultReporter");
var Runner = (function () {
    function Runner(reporter, evaluator, baseline) {
        /**
         * The minimum percent difference from baseline that is reported as a change.
         */
        this.threshold = 5;
        /**
         * The minimum percent confidence that the test has changed from baseline.
         */
        this.confidence = 95;
        this._slower = 0;
        this._reporter = reporter || new DefaultReporter();
        this._evaluator = evaluator || new Evaluator(new NodeTimer(), this._reporter);
        this._baseline = baseline;
    }
    Runner.prototype.run = function (suite, callback) {
        var _this = this;
        this._runSuite(suite, function (err) {
            if (err)
                return callback(err);
            _this._reporter.end();
            callback(null, _this._slower);
        });
    };
    Runner.prototype._runSuite = function (suite, callback) {
        var _this = this;
        this._reporter.suiteStart(suite);
        // execute "before" hooks
        async.eachSeries(suite.before, function (action, done) { return action.run(done); }, function (err) {
            if (err)
                return callback(err);
            // for each test
            async.eachSeries(suite.tests, function (test, done) { return _this._runTest(suite, test, done); }, function (err) {
                if (err)
                    return callback(err);
                if (suite.compare && !suite.pending) {
                    _this._compareTests(suite);
                }
                // execute any other suites
                async.eachSeries(suite.suites, function (suite, done) { return _this._runSuite(suite, done); }, function (err) {
                    if (err)
                        return callback(err);
                    // execute "after" hooks
                    async.eachSeries(suite.after, function (action, done) { return action.run(done); }, function (err) {
                        if (err)
                            return callback(err);
                        _this._reporter.suiteEnd(suite);
                        callback();
                    });
                });
            });
        });
    };
    Runner.prototype._runTest = function (suite, test, callback) {
        var _this = this;
        if (suite.pending || test.pending) {
            this._reporter.pending(test);
            process.nextTick(callback);
            return;
        }
        this._reporter.testStart(test);
        // execute "beforeEach" hooks
        async.eachSeries(suite.beforeEach, function (action, done) { return action.run(done); }, function (err) {
            if (err)
                return callback(err);
            // evaluate the test
            _this._evaluator.evaluate(test, function (err) {
                if (err)
                    return callback(err);
                // execute "afterEach" hooks
                async.eachSeries(suite.afterEach, function (action, done) { return action.run(done); }, function (err) {
                    if (err)
                        return callback(err);
                    if (_this._baseline) {
                        var percentChange = _this._baseline.compare(test, _this.confidence);
                        if (percentChange !== undefined) {
                            if (!isFinite(percentChange) || Math.abs(percentChange) < _this.threshold) {
                                percentChange = undefined;
                            }
                            else {
                                if (percentChange < 0) {
                                    _this._slower++;
                                }
                            }
                        }
                    }
                    _this._reporter.testEnd(test, percentChange);
                    callback();
                });
            });
        });
    };
    Runner.prototype._compareTests = function (suite) {
        var _this = this;
        var tests = suite.filter('successful'), fastest = suite.filter('fastest'), slowest = suite.filter('slowest');
        if (fastest.length == 0)
            return;
        var fastestHz = fastest[0].adjustedHz;
        tests.forEach(function (test) {
            if (test.pending)
                return;
            var hz = test.adjustedHz, percentSlower = (1 - (hz / fastestHz)) * 100, rank = 0;
            if (fastest.indexOf(test) !== -1) {
                rank = 1;
            }
            else {
                if (slowest.indexOf(test) !== -1) {
                    rank = -1;
                }
            }
            _this._reporter.rank(test, rank, rank !== 1 && isFinite(hz) ? percentSlower : undefined);
        });
    };
    return Runner;
})();
module.exports = Runner;
//# sourceMappingURL=runner.js.map