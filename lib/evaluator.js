/*!
 * The code in this module is a modified version of code originally from
 * Benchmark.js. Original Copyright follows.
 *
 * Benchmark.js v2.0.0-pre <http://benchmarkjs.com/>
 * Copyright 2010-2015 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
var Stats = require("./stats");
/**
 * Class for evaluating the performance of a Test.
 */
var Evaluator = (function () {
    function Evaluator(timer, reporter) {
        /**
         * The maximum time a test is allowed to run, in seconds, before finishing
         */
        this.maxTime = 2;
        /**
         * The delay, in milliseconds, between asynchronous test cycles.
         */
        this.delay = 5;
        /**
         * The time needed, in seconds, to reduce the percent uncertainty of a test to 1%
         */
        this._minTime = 0;
        /**
         * The minimum sample size required to perform statistical analysis.
         */
        this._minSamples = 5;
        this._timer = timer;
        // resolve time span required to achieve a percent uncertainty of at most 1%
        // http://spiff.rit.edu/classes/phys273/uncert/uncert.html
        this._minTime = Math.max(this._timer.resolution / 2 / 0.01, 0.05);
        this._reporter = reporter;
    }
    /**
     * Evaluates the performance of a Test.
     * @param test The Test to evaluate.
     * @param callback Function called when evaluation completes.
     */
    Evaluator.prototype.evaluate = function (test, callback) {
        test.setup(this._timer);
        var self = this;
        (function next() {
            var _this = this;
            self._cycle(test, function (err, period) {
                if (err)
                    return callback(err);
                // add the cycle execution time to the list of sample
                var size = test.sample.push(period);
                // sample mean (estimate of the population mean)
                test.mean = Stats.mean(test.sample);
                // sample variance (estimate of the population variance)
                var variance = Stats.variance(test.sample, test.mean);
                // sample standard deviation (estimate of the population standard deviation)
                var sd = Math.sqrt(variance);
                // standard error of the mean (aka the standard deviation of the sampling distribution of the sample mean)
                var sem = sd / Math.sqrt(size);
                // margin of error
                test.moe = sem * Stats.criticalValue(size - 1);
                // relative margin of error
                test.rme = (test.moe / test.mean) * 100 || 0;
                // operations per second
                test.hz = 1 / test.mean;
                // report cycle results
                self._reporter && self._reporter.cycle(test);
                // decide if we need another cycle or not
                if (size >= self._minSamples && (new Date().getTime() - test.timestamp.getTime()) / 1e3 >= self.maxTime) {
                    // If we have met the minimum number of samples and exceeded the max allocated time, then we are finished
                    callback();
                }
                else {
                    setTimeout(next, _this.delay);
                }
            });
        })();
    };
    /**
     * Cycles a Test util a run count can be established.
     * @param test The Test to evaluate.
     * @param callback Function called when cycle completes with the time, in seconds, per operation.
     */
    Evaluator.prototype._cycle = function (test, callback) {
        var _this = this;
        test.cycles++;
        test.run(function (err) {
            if (err)
                return callback(err);
            // seconds per operation
            var period = test.clocked / test.count;
            if (test.clocked < _this._minTime) {
                // The test execution time was less than the minimum time required so increase the number of times the
                // test is executed in order to reach minTime.
                test.count += Math.ceil((_this._minTime - test.clocked) / period);
                _this._cycle(test, callback);
            }
            else {
                callback(null, period);
            }
        });
    };
    return Evaluator;
})();
module.exports = Evaluator;
//# sourceMappingURL=evaluator.js.map