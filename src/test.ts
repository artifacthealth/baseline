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