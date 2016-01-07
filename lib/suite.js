/*!
 * The code for the 'filter' function is a modified version of code
 * originally from Benchmark.js. Original Copyright follows.
 *
 * Benchmark.js v2.0.0-pre <http://benchmarkjs.com/>
 * Copyright 2010-2015 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
var Runnable = require("./runnable");
var Suite = (function () {
    function Suite(title) {
        if (title === void 0) { title = ""; }
        this.title = title;
        this.tests = [];
        this.suites = [];
        this.before = [];
        this.after = [];
        this.beforeEach = [];
        this.afterEach = [];
    }
    Object.defineProperty(Suite.prototype, "pending", {
        /**
         * Indicates if the suite is pending.
         */
        get: function () {
            return this._pending || (this.parent && this.parent.pending);
        },
        set: function (value) {
            this._pending = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Suite.prototype, "testCount", {
        get: function () {
            if (this.pending)
                return 0;
            var count = 0;
            for (var i = 0; i < this.tests.length; i++) {
                count += this.tests[i].pending ? 0 : 1;
            }
            for (var i = 0; i < this.suites.length; i++) {
                count += this.suites[i].testCount;
            }
            return count;
        },
        enumerable: true,
        configurable: true
    });
    Suite.prototype.addSuite = function (suite) {
        this.suites.push(suite);
        suite.parent = this;
    };
    Suite.prototype.addTest = function (test) {
        this.tests.push(test);
        test.parent = this;
    };
    Suite.prototype.addBefore = function (action) {
        this.before.push(new Runnable(action));
    };
    Suite.prototype.addAfter = function (action) {
        this.after.push(new Runnable(action));
    };
    Suite.prototype.addBeforeEach = function (action) {
        this.beforeEach.push(new Runnable(action));
    };
    Suite.prototype.addAfterEach = function (action) {
        this.afterEach.push(new Runnable(action));
    };
    Suite.prototype.filter = function (callback, thisArg) {
        if (typeof callback == "string") {
            if (callback === 'successful') {
                // Callback to exclude those that are errored, unrun, or have hz of Infinity.
                callback = function (test) {
                    return test.cycles && isFinite(test.hz);
                };
            }
            else if (callback === 'fastest' || callback === 'slowest') {
                // Get successful, sort by period + margin of error, and filter fastest/slowest.
                var result = this.filter('successful').sort(function (a, b) {
                    return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback === 'fastest' ? 1 : -1);
                });
                return result.filter(function (test) {
                    return result[0].compare(test) == 0;
                });
            }
        }
        return this.tests.filter(callback, thisArg);
    };
    return Suite;
})();
module.exports = Suite;
//# sourceMappingURL=suite.js.map