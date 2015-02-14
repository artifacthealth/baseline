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
    protected execute(callback: Callback): void {

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
            // execute async
            this._resetTimeout();
            try {
                this.invoke(done);
            }
            catch(err) {
                done(err);
            }
            return;
        }

        // execute sync
        try {
            this.invoke();
            process.nextTick(done);
        }
        catch(err) {
            process.nextTick(() => done(err));
        }
    }

    protected invoke(callback?: Callback): void {

        this.action(callback);
    }

    private _resetTimeout(): void {

        var ms = this.timeout || 60000;
        this._clearTimeout();

        this._timeoutTimer = setTimeout(function () {
            this.callback(new Error('timeout of ' + ms + 'ms exceeded. Ensure the done() callback is being called in this measure.'));
            this.timedOut = true;
        }, ms);
    }

    private _clearTimeout(): void {
        clearTimeout(this._timeoutTimer);
    }
}

export = Runnable;