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
    minTime = 0;

    /**
     * The minimum sample size required to perform statistical analysis.
     */
    minSamples = 5;

    /**
     * The timer to use for tests.
     */
    private _timer: Timer;

    constructor(timer: Timer) {

        this._timer = timer;

        // resolve time span required to achieve a percent uncertainty of at most 1%
        // http://spiff.rit.edu/classes/phys273/uncert/uncert.html
        this.minTime = this._timer.resolution / 2 / 0.01;
    }

    /**
     * Evaluates the performance of a Test.
     * @param test The Test to evaluate.
     * @param callback Function called when evaluation completes.
     */
    evaluate(test: Test, callback: Callback): void {

        var sample: number[] = [],
            self = this;

        test.timestamp = new Date();

        (function next() {
            self._cycle(test, (err: Error, period?: number) => {
                if(err) return callback(err);

                var size = sample.push(period);

                // sample mean (estimate of the population mean)
                var mean = Stats.mean(sample);
                // sample variance (estimate of the population variance)
                var variance = Stats.variance(sample, mean);
                // sample standard deviation (estimate of the population standard deviation)
                var sd = Math.sqrt(variance);
                // standard error of the mean (aka the standard deviation of the sampling distribution of the sample mean)
                var sem = sd / Math.sqrt(size);
                // margin of error
                var moe = sem * Stats.criticalValue(size - 1);
                // relative margin of error
                test.rme = (moe / mean) * 100 || 0;
                // operations per second
                test.hz = 1 / mean;

                if(size >= self.minSamples && (new Date().getTime() - test.timestamp.getTime()) / 1e3 >= self.maxTime) {
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

        this._clock(test, (err: Error, clocked?: number) => {
            if(err) return callback(err);

            // seconds per operation
            var period = clocked / test.count;
            if(clocked < this.minTime) {
                test.count += Math.ceil((this.minTime - clocked) / period);
                this._cycle(test, callback);
            }
            else {
                callback(null, period);
            }
        });
    }

    /**
     * Clocks the time taken to execute a test per cycle
     * @param test The Test to evaluate.
     * @param callback Called with the time, in seconds, to execute a test cycle,
     */
    private _clock(test: Test, callback: ResultCallback<number>): void {

        // cumulative time spent executing Test
        var clocked = 0;
        // number of times to execute Test
        var count = test.count;

        var self = this;
        (function next() {
            test.run(self._timer, (err: Error, duration?: number) => {
                if (err) return callback(err);

                clocked += duration;

                if (count-- == 0) {
                    callback(null, clocked)
                }
                else {
                    next();
                }
            });
        })();
    }
}

export = Evaluator;