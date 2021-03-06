/*!
 * The code for 'resolution' is a modified version of code
 * originally from Benchmark.js. Original Copyright follows.
 *
 * Benchmark.js v2.0.0-pre <http://benchmarkjs.com/>
 * Copyright 2010-2015 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
/// <reference path="./types.d.ts" />
var Stats = require("./stats");
var Timer = (function () {
    function Timer() {
    }
    /**
     * Starts a timer. Returns a value that should be passed to 'stop' in order to get the duration.
     */
    Timer.prototype.start = function () {
        throw new Error("Not implemented.");
    };
    /**
     * Stops a timer. Returns the duration in seconds.
     * @param start The value returned from 'start'.
     */
    Timer.prototype.stop = function (start) {
        throw new Error("Not implemented.");
    };
    Object.defineProperty(Timer.prototype, "resolution", {
        /**
         * The smallest unit the timer can measure.
         */
        get: function () {
            if (this._resolution !== undefined) {
                return this._resolution;
            }
            var measured, count = 30, sample = [];
            while (count--) {
                measured = this.stop(this.start());
                if (measured > 0) {
                    sample.push(measured);
                }
                else {
                    sample.push(Infinity);
                    break;
                }
            }
            return this._resolution = Stats.mean(sample);
        },
        enumerable: true,
        configurable: true
    });
    return Timer;
})();
module.exports = Timer;
//# sourceMappingURL=timer.js.map