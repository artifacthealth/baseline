/// <reference path="./types.d.ts" />

import async = require("async");
import Runnable = require("./runnable");
import Action = require("./action");
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
    setup: Action[];

    /**
     * List of actions to execute after Test in run. Not included in timed duration.
     */
    teardown: Action[];


    constructor(public title: string, action: ActionCallback) {
        super(action);
    }

    /**
     * Runs the action and returns the execution time, in milliseconds.
     * @param timer The timer to use to measure the duration of the test.
     * @param callback Function called after action completes.
     */
    run(timer: Timer, callback: ResultCallback<number>): void {

        // execute "setup" actions
        async.eachSeries(this.setup, (action: Action, done: Callback) => action.run(done), (err: Error) => {
            if(err) return callback(err);

            this.execute(timer, (err: Error, duration?: number) => {
                if(err) return callback(err);

                // execute "teardown" actions
                async.eachSeries(this.teardown, (action: Action, done: Callback) => action.run(done), (err: Error) => {
                    if(err) return callback(err);

                    callback(null, duration);
                });
            })
        })
    }
}

export = Test;