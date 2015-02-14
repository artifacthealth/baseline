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

    /**
     * Time taken to complete the last test cycle.
     */
    duration: number;

    /**
     * Timer to use.
     */
    private _timer: Timer;

    constructor(public title: string, action: ActionCallback) {
        super(action);
    }

    /**
     * Clocks the time taken to execute a test per cycle
     * @param callback Called with the time, in seconds, to execute a test cycle,
     */
    clock(timer: Timer, callback: ResultCallback<number>): void {

        this._timer = timer;
        this.execute((err: Error) => {
            if(err) return callback(err);
            callback(null, this.duration);
        });

    }

    protected invoke(callback?: Callback): void {

        var i = this.count;

        if(!this.async) {
            var start = this._timer.start();
            while(i--) {
                this.action();
            }
            this.duration = this._timer.stop(start);
            return;
        }

        var self = this,
            start = this._timer.start();
        (function next() {
            self.action((err: Error) => {
                if (err) return callback(err) ;

                if (i-- == 0) {
                    this.duration = this._timer.stop(start);
                    callback(null);
                }
                else {
                    next();
                }
            });
        })();
    }
}

export = Test;