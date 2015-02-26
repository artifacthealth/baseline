var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Timer = require("./timer");
/**
 * Standard NodeJS high-resolution timer.
 */
var NodeTimer = (function (_super) {
    __extends(NodeTimer, _super);
    function NodeTimer() {
        _super.apply(this, arguments);
    }
    /**
     * Starts a timer. Returns a value that should be passed to 'stop' in order to get the duration.
     */
    NodeTimer.prototype.start = function () {
        return process.hrtime();
    };
    /**
     * Stops a timer. Returns the duration in seconds.
     * @param start The value returned from 'start'.
     */
    NodeTimer.prototype.stop = function (start) {
        var stop = process.hrtime(start);
        return stop[0] + (stop[1] / 1e9);
    };
    return NodeTimer;
})(Timer);
module.exports = NodeTimer;
//# sourceMappingURL=nodeTimer.js.map