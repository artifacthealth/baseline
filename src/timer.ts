/// <reference path="./types.d.ts" />

import Stats = require("./stats");

class Timer {

    /**
     * Starts a timer. Returns a value that should be passed to 'stop' in order to get the duration.
     */
    start(): any {
        throw new Error("Not implemented.");
    }

    /**
     * Stops a timer. Returns the duration in seconds.
     * @param start The value returned from 'start'.
     */
    stop(start: any): number {
        throw new Error("Not implemented.");
    }

    private _resolution: number;
    /**
     * Establishes the smallest unit the timer can test.
     */
    get resolution(): number {

        if(this._resolution !== undefined) {
            return this._resolution;
        }

        var measured: number,
            count = 30,
            sample: number[] = [];

        // get average smallest measurable time
        while (count--) {
            measured = this.stop(this.start());
            if (measured > 0) {
                sample.push(measured);
            } else {
                sample.push(Infinity);
                break;
            }
        }

        // convert to seconds
        return this._resolution = Stats.mean(sample);
    }
}

export = Timer;