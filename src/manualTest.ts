import Test = require("./test");
import Timer = require("./timer");

class ManualTest extends Test {

    constructor(public title: string, action?: LoopCallback) {
        super(title, <any>action);

        this.async = action.length > 1;
    }

    protected invoke(callback: Callback): void {

        // execute an async test
        if (this.async) {
            // test has indicated that it wants to handle the test loop
            var start = this.timer.start();
            (<any>this.action)(this.count, (err: Error) => {
                this.clocked = this.timer.stop(start);
                callback(err);
            });
            return;
        }

        // test has indicated that it wants to handle the test loop
        var start = this.timer.start();
        (<any>this.action)(this.count);
        this.clocked = this.timer.stop(start);
        callback();
    }
}

export = ManualTest;