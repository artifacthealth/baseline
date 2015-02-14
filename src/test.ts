/// <reference path="./types.d.ts" />

import async = require("async");
import Runnable = require("./runnable");
import Timer = require("./timer");

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

    protected invoke(callback: Callback): void {

        var i = this.count;

        if(!this.async) {
            var start = this.timer.start();
            while (i--) {
                this.action();
            }
            this.clocked = this.timer.stop(start);
            return;
        }

        var self = this,
            start = this.timer.start();
        (function next() {
            try {
                self.action((err: Error) => {
                    if (err) return callback(err);

                    if (i-- == 0) {
                        this.clocked = this.timer.stop(start);
                        callback();
                    }
                    else {
                        next();
                    }
                });
            }
            catch(err) {
                callback(err);
            }
        })();
    }
}

export = Test;