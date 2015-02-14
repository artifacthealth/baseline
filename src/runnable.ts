/// <reference path="./types.d.ts" />

import Timer = require("./timer");

/**
 * Class for running and timing an action. Handles both synchronous and asynchronous actions.
 */
class Runnable {

    /**
     * Maximum execution time for the action in milliseconds.
     */
    timeout: number;

    /**
     * True if the action timed out.
     */
    timedOut: boolean;

    private _action: ActionCallback;
    private _async: boolean;
    private _timer: NodeJS.Timer;
    private _callback: Callback;

    constructor(action: ActionCallback) {

        if(!action) {
            throw new Error("Missing require argument 'action'.");
        }

        this._action = action;
        this._async = !!action.length;
    }

    /**
     * Runs the action. Duration, in milliseconds, is returned if a timer is provided.
     * @param timer The timer to use to measure the duration of the action. If null, the action is not timed.
     * @param callback Function called after action completes.
     */
    protected execute(timer: Timer, callback: ResultCallback<number>): void {

        var finished = false,
            self = this;

        if(timer) {
            var start = timer.start();
        }

        function done(err?: Error) {

            if(timer) {
                var duration = timer.stop(start);
            }
            if(self.timedOut) return;
            self._clearTimeout();
            if(finished) {
                callback(new Error("done() called multiple times"));
                return;
            }
            finished = true;
            // calculate duration and execute callback
            callback(err, timer ? duration : undefined);
        }

        this._callback = done;

        if(this._async) {
            // execute async
            this._resetTimeout();
            try {
                this._action(done);
            }
            catch(err) {
                done(err);
            }
            return;
        }

        // execute sync
        try {
            this._action();
            process.nextTick(done);
        }
        catch(err) {
            process.nextTick(() => done(err));
        }
    }

    private _resetTimeout(): void {

        var ms = this.timeout || 60000;
        this._clearTimeout();

        this._timer = setTimeout(function () {
            this.callback(new Error('timeout of ' + ms + 'ms exceeded. Ensure the done() callback is being called in this measure.'));
            this.timedOut = true;
        }, ms);
    }

    private _clearTimeout(): void {
        clearTimeout(this._timer);
    }
}

export = Runnable;