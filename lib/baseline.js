/// <reference path="./types.d.ts" />
/// <reference path="../typings/node.d.ts" />
/// <reference path="../typings/glob.d.ts"/>
/// <reference path="../typings/async.d.ts"/>
var glob = require("glob");
var path = require("path");
var Suite = require("./suite");
var Test = require("./test");
var Evaluator = require("./evaluator");
var NodeTimer = require("./nodeTimer");
var Runner = require("./runner");
var DefaultReporter = require("./reporters/defaultReporter");
var MinimalReporter = require("./reporters/minimalReporter");
var Results = require("./results");
var Baseline = (function () {
    function Baseline() {
        /**
         * The minimum percent difference from baseline that is reported as a change.
         */
        this.threshold = 10;
        /**
         * The maximum time a test is allowed to run, in seconds, before finishing
         */
        this.maxTime = 2;
        /**
         * Indicates whether or not the baseline should be updated.
         */
        this.updateBaseline = false;
    }
    Baseline.prototype.run = function (callback) {
        var _this = this;
        this._suite = new Suite();
        this._loadFiles();
        Results.load(this.baselinePath, function (err, baseline) {
            if (err)
                return callback(err);
            var reporter = _this.reporter || new DefaultReporter();
            reporter.useColors = _this.useColors;
            var evaluator = new Evaluator(new NodeTimer(), reporter);
            evaluator.maxTime = _this.maxTime;
            var runner = new Runner(reporter, evaluator, baseline);
            runner.threshold = _this.threshold;
            runner.run(_this._suite, function (err, slower) {
                if (err)
                    return callback(err);
                if ((!baseline || _this.updateBaseline) && _this.baselinePath) {
                    Results.fromSuite(_this._suite).save(_this.baselinePath, function (err) {
                        if (err)
                            return callback(err);
                        callback(null, slower);
                    });
                    return;
                }
                callback(null, slower);
            });
        });
    };
    Baseline.prototype._loadFiles = function () {
        var _this = this;
        this.files.forEach(function (searchPath) {
            glob.sync(searchPath).forEach(function (match) {
                _this._createGlobals(global);
                require(path.resolve(match));
            });
        });
    };
    Baseline.prototype._createGlobals = function (context) {
        var _this = this;
        var suites = [this._suite];
        context.suite = function (title, block) {
            var suite = new Suite(title);
            suites[0].addSuite(suite);
            suites.unshift(suite);
            block.call(suite);
            suites.shift();
            return suite;
        };
        context.suite.skip = function (title, block) {
            var suite = context.suite(title, block);
            suite.pending = true;
            return suite;
        };
        context.compare = function (title, block) {
            var suite = context.suite(title, block);
            suite.compare = true;
            return suite;
        };
        context.compare.skip = function (title, block) {
            var suite = context.suite.skip(title, block);
            suite.compare = true;
            return suite;
        };
        context.test = function (title, action) {
            var test = new Test(title, action);
            suites[0].addTest(test);
            test.timeout = _this.timeout;
            return test;
        };
        context.test.skip = function (title, action) {
            var test = global.test(title, action);
            test.pending = true;
            return test;
        };
        context.after = function (action) {
            suites[0].addAfter(action);
        };
        context.before = function (action) {
            suites[0].addBefore(action);
        };
        context.afterEach = function (action) {
            suites[0].addAfterEach(action);
        };
        context.beforeEach = function (action) {
            suites[0].addBeforeEach(action);
        };
    };
    Baseline.DefaultReporter = DefaultReporter;
    Baseline.MinimalReporter = MinimalReporter;
    return Baseline;
})();
module.exports = Baseline;
//# sourceMappingURL=baseline.js.map