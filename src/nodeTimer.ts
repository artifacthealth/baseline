import Timer = require("./timer");

/**
 * Standard NodeJS high-resolution timer.
 */
class NodeTimer extends Timer {

    /**
     * Starts a timer. Returns a value that should be passed to 'stop' in order to get the duration.
     */
    start(): any {
        return process.hrtime();
    }

    /**
     * Stops a timer. Returns the duration in seconds.
     * @param start The value returned from 'start'.
     */
    stop(start: any): number {
        var stop = process.hrtime(start);
        return stop[0] + (stop[1]/1e9);
    }
}

export = NodeTimer;