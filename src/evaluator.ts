/// <reference path="./types.d.ts" />

import async = require("async");
import Test = require("./test");
import Stats = require("./stats");
import Timer = require("./timer");

/**
 * Class for evaluating the performance of a Test.
 */
class Evaluator {

    /**
     * The maximum time a test is allowed to run, in seconds, before finishing
     */
    maxTime = 2;

    /**
     * The time needed, in seconds, to reduce the percent uncertainty of a test to 1%
     */
    private _minTime = 0;

    /**
     * The minimum sample size required to perform statistical analysis.
     */
    private _minSamples = 5;

    /**
     * The timer to use for tests.
     */
    private _timer: Timer;

    constructor(timer: Timer) {

        this._timer = timer;

        // resolve time span required to achieve a percent uncertainty of at most 1%
        // http://spiff.rit.edu/classes/phys273/uncert/uncert.html
        this._minTime = Math.max(this._timer.resolution / 2 / 0.01, 0.05);
    }

    /**
     * Evaluates the performance of a Test.
     * @param test The Test to evaluate.
     * @param callback Function called when evaluation completes.
     */
    evaluate(test: Test, callback: Callback): void {

        test.setup(this._timer);

        var self = this;
        (function next() {
            self._cycle(test, (err: Error, period?: number) => {
                if(err) return callback(err);

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

                if(size >= self._minSamples && (new Date().getTime() - test.timestamp.getTime()) / 1e3 >= self.maxTime) {
                    // If we have met the minimum number of samples and exceeded the max allocated time, then we are finished
                    callback();
                }
                else {
                    next();
                }
            });
        })();
    }

    /**
     * Cycles a Test util a run count can be established.
     * @param test The Test to evaluate.
     * @param callback Function called when cycle completes with the time, in seconds, per operation.
     */
    private _cycle(test: Test, callback: ResultCallback<number>): void {

        test.cycles++;

        test.run((err: Error) => {
            if(err) return callback(err);

            // seconds per operation
            var period = test.clocked / test.count;
            if(test.clocked < this._minTime) {
                // The test execution time was less than the minimum time required so increase the number of times the
                // test is executed in order to reach minTime.
                test.count += Math.ceil((this._minTime - test.clocked) / period);
                this._cycle(test, callback);
            }
            else {
                callback(null, period);
            }
        });
    }
}

export = Evaluator;