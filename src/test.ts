/// <reference path="./types.d.ts" />

import async = require("async");
import Runnable = require("./runnable");
import Timer = require("./timer");
import Stats = require("./stats");
import Suite = require("./suite");

/**
 * Class that represents a benchmarking test.
 */
class Test extends Runnable {

    parent: Suite;

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
     * Time taken to complete the last test cycle, in seconds.
     */
    clocked: number;

    /**
     * The timer to use when running the test.
     */
    timer: Timer;

    /**
     * Indicates if the test is pending.
     */
    pending: boolean;


    /**
     * Gets the Hz, i.e. operations per second, of `test` adjusted for the margin of error.
     */
    get adjustedHz(): number {
        return 1 / (this.mean + this.moe);
    }

    constructor(public title: string, action?: ActionCallback) {
        super(action);

        this.pending = !action;
    }

    /**
     * Gets a test ready for evaluation
     * @param timer The timer to use when clocking the test.
     */
    setup(timer: Timer): void {

        this.sample = [];
        this.timer = timer;
        this.timestamp = new Date();
    }

    /**
     * Determines if a test is faster than another benchmark.
     * @param other The test to compare.
     * @returns Returns '-1' if slower than 'other', '1' if faster than 'other', and '0' if indeterminate.
     */
    compare(other: Test): number {

        // Exit early if comparing the same tests.
        if (this == other) {
            return 0;
        }

        return Stats.mannWhitneyUTest(this.sample, other.sample);
    }

    protected invoke(callback: Callback): void {

        var count = this.count,
            self = this,
            start: any;

        // define async loop
        function next() {
            self.action((err: Error) => {
                if (err) return callback(err);

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
    }
}

export = Test;
