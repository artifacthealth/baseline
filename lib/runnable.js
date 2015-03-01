/// <reference path="./types.d.ts" />
/**
 * Class for running an action. Handles both synchronous and asynchronous actions.
 */
var Runnable = (function () {
    function Runnable(action) {
        this.action = action;
        if (action) {
            this.async = action.length > 0;
        }
    }
    /**
     * Runs the action.
     * @param callback Function called after action completes.
     */
    Runnable.prototype.run = function (callback) {
        var _this = this;
        var finished = false, self = this;
        if (!this.action) {
            process.nextTick(callback);
        }
        function done(err) {
            if (self.timedOut)
                return;
            self._clearTimeout();
            if (finished) {
                callback(new Error("done() called multiple times"));
                return;
            }
            finished = true;
            // calculate duration and execute callback
            callback(err);
        }
        if (this.async) {
            this._callback = done;
            this._resetTimeout();
        }
        process.nextTick(function () { return _this.invoke(done); });
    };
    Runnable.prototype.invoke = function (callback) {
        if (this.async) {
            // execute async
            this.action(callback);
            return;
        }
        // execute sync
        this.action();
        callback();
    };
    Runnable.prototype._resetTimeout = function () {
        var _this = this;
        var ms = this.timeout || 60000;
        this._clearTimeout();
        this._timeoutTimer = setTimeout(function () {
            _this._callback(new Error('timeout of ' + ms + 'ms exceeded. Ensure the done() callback is being called in this test.'));
            _this.timedOut = true;
        }, ms);
    };
    Runnable.prototype._clearTimeout = function () {
        clearTimeout(this._timeoutTimer);
    };
    return Runnable;
})();
module.exports = Runnable;
//# sourceMappingURL=runnable.js.map