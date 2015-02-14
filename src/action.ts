/// <reference path="./types.d.ts" />

import Runnable = require("./runnable")

/**
 * Class for running an action. Handles both synchronous and asynchronous actions.
 */
class Action extends Runnable {

    /**
     * Runs the action.
     * @param callback Function called after action completes.
     */
    run(callback: Callback): void {
        this.execute(callback);
    }
}

export = Action;