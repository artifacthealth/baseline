/// <reference path="./types.d.ts" />

import async = require("async");
import Runnable = require("./runnable");
import Timer = require("./timer");
import Stats = require("./stats");

/**
 * Class that represents a benchmarking test.
 */
class Test extends Runnable {

    /**
     * The number of times a test was executed.
     */
    count = 1;

    /**
     * The number of cycles performed while benchmarking.
     */
    cycles = 0;

    /**
     * The number of executions per second.
     */
    hz = 0;

    /**
     * The relative margin of error (expressed as a percentage of the mean.)
     */
    rme = 0;

    /**
     * The margin of error.
     */
    moe = 0;

    /**
     * The sample arithmetic mean (secs).
     */
    mean = 0;


    /**
     * The array of sample periods.
     */
    sample: number[];

    /**
     * A timestamp of when the benchmark started.
     */
    timestamp: Date;

    /**
     * List of actions to execute before Test is run. Not included in timed duration.
     */
    setup: Runnable[];

    /**
     * List of actions to execute after Test in run. Not included in timed duration.
     */
    teardown: Runnable[];

    /**
     * Time taken to complete the last test cycle, in seconds.
     */
    clocked: number;

    /**
     * The timer to use when running the test.
     */
    timer: Timer;

    constructor(public title: string, action: ActionCallback) {
        super(action);
    }

    /**
     * Determines if a test is faster than another.
     * @param other The test to compare.
     * @returns Returns `-1` if slower, `1` if faster, and `0` if indeterminate.
     */
    compare(other: Test): number {

        // Exit early if comparing the same benchmark.
        if (this == other) {
            return 0;
        }

        var sample1 = this.sample,
            sample2 = other.sample,
            size1 = sample1.length,
            size2 = sample2.length,
            maxSize = Math.max(size1, size2),
            minSize = Math.min(size1, size2),
            u1 = getU(sample1, sample2),
            u2 = getU(sample2, sample1),
            u = Math.min(u1, u2);

        function getScore(xA: number, sampleB: number[]) {

            return sampleB.reduce((total, xB) => {
                return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
            }, 0);
        }

        function getU(sampleA: number[], sampleB: number[]) {

            return sampleA.reduce((total, xA) => {
                return total + getScore(xA, sampleB);
            }, 0);
        }

        function getZ(u: number) {

            return (u - ((size1 * size2) / 2)) / Math.sqrt((size1 * size2 * (size1 + size2 + 1)) / 12);
        }

        // Reject the null hyphothesis the two samples come from the
        // same population (i.e. have the same median) if...
        if (size1 + size2 > 30) {
            // ...the z-stat is greater than 1.96 or less than -1.96
            // http://www.statisticslectures.com/topics/mannwhitneyu/
            var zStat = getZ(u);
            return Math.abs(zStat) > 1.96 ? (u == u1 ? 1 : -1) : 0;
        }

        // ...the U value is less than or equal the critical U value.
        var critical = maxSize < 5 || minSize < 3 ? 0 : Stats.uTable[maxSize][minSize - 3];
        return u <= critical ? (u == u1 ? 1 : -1) : 0;
    }

    protected invoke(callback: Callback): void {

        // execute "setup" hooks
        async.eachSeries(this.setup, (action: Runnable, done: Callback) => action.run(done), (err: Error) => {
            if (err) return callback(err);

            if (!this.async) {
                var count = this.count,
                    start = this.timer.start();
                while (count--) {
                    this.action();
                }

                this.clocked = this.timer.stop(start);

                // execute "teardown" hooks
                async.eachSeries(this.teardown, (action: Runnable, done: Callback) => action.run(done), callback);
                return;
            }

            var self = this,
                count = this.count,
                start = this.timer.start();

            next();

            function next() {
                self.action((err: Error) => {
                    if (err) return callback(err);

                    if (--count == 0) {
                        self.clocked = self.timer.stop(start);

                        // execute "teardown" hooks
                        async.eachSeries(self.teardown, (action: Runnable, done: Callback) => action.run(done), callback);
                    }
                    else {
                        next();
                    }
                });
            }
        });
    }
}

export = Test;