/// <reference path="./types.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Runnable = require("./runnable");
var Stats = require("./stats");
/**
 * Class that represents a benchmarking test.
 */
var Test = (function (_super) {
    __extends(Test, _super);
    function Test(title, action) {
        _super.call(this, action);
        this.title = title;
        /**
         * The number of times a test was executed.
         */
        this.count = 1;
        /**
         * The number of cycles performed while benchmarking.
         */
        this.cycles = 0;
        /**
         * The number of executions per second.
         */
        this.hz = 0;
        /**
         * The relative margin of error (expressed as a percentage of the mean.)
         */
        this.rme = 0;
        /**
         * The margin of error.
         */
        this.moe = 0;
        /**
         * The sample arithmetic mean (secs).
         */
        this.mean = 0;
        this.pending = !action;
    }
    Object.defineProperty(Test.prototype, "adjustedHz", {
        /**
         * Gets the Hz, i.e. operations per second, of `test` adjusted for the margin of error.
         */
        get: function () {
            return 1 / (this.mean + this.moe);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets a test ready for evaluation
     * @param timer The timer to use when clocking the test.
     */
    Test.prototype.setup = function (timer) {
        this.sample = [];
        this.timer = timer;
        this.timestamp = new Date();
    };
    /**
     * Determines if a test is faster than another benchmark.
     * @param other The test to compare.
     * @returns Returns '-1' if slower than 'other', '1' if faster than 'other', and '0' if indeterminate.
     */
    Test.prototype.compare = function (other) {
        // Exit early if comparing the same tests.
        if (this == other) {
            return 0;
        }
        return Stats.mannWhitneyUTest(this.sample, other.sample);
    };
    Test.prototype.invoke = function (callback) {
        var count = this.count, self = this, start;
        // define async loop
        function next() {
            self.action(function (err) {
                if (err)
                    return callback(err);
                if (--count == 0) {
                    self.clocked = self.timer.stop(start);
                    callback();
                }
                else {
                    next();
                }
            });
        }
        if (this.async) {
            // execute an async test
            start = this.timer.start();
            next();
            return;
        }
        // execute a synchronous test
        start = this.timer.start();
        while (count--) {
            this.action();
        }
        this.clocked = this.timer.stop(start);
        callback();
    };
    return Test;
})(Runnable);
module.exports = Test;
//# sourceMappingURL=test.js.map