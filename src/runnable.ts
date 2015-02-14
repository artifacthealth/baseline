/// <reference path="./types.d.ts" />

/**
 * Class for running an action. Handles both synchronous and asynchronous actions.
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

    protected async: boolean;

    private _timeoutTimer: NodeJS.Timer;
    private _callback: Callback;

    constructor(protected action: ActionCallback) {

        if(!action) {
            throw new Error("Missing require argument 'action'.");
        }

        this.async = !!action.length;
    }

    /**
     * Runs the action.
     * @param callback Function called after action completes.
     */
    run(callback: Callback): void {

        var finished = false,
            self = this;

        function done(err?: Error) {

            if(self.timedOut) return;
            self._clearTimeout();
            if(finished) {
                callback(new Error("done() called multiple times"));
                return;
            }
            finished = true;
            // calculate duration and execute callback
            callback(err);
        }

        this._callback = done;
        if(this.async) {
            this._resetTimeout();
        }

        process.nextTick(() => this.invoke(done));
    }

    protected invoke(callback: Callback): void {

        if(this.async) {
            // execute async
            this.action(callback);
            return;
        }

        // execute sync
        this.action();
        callback();
    }

    private _resetTimeout(): void {

        var ms = this.timeout || 60000;
        this._clearTimeout();

        this._timeoutTimer = setTimeout(function () {
            this._callback(new Error('timeout of ' + ms + 'ms exceeded. Ensure the done() callback is being called in this measure.'));
            this.timedOut = true;
        }, ms);
    }

    private _clearTimeout(): void {
        clearTimeout(this._timeoutTimer);
    }
}

export = Runnable;