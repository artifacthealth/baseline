var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Test = require("./test");
var ManualTest = (function (_super) {
    __extends(ManualTest, _super);
    function ManualTest(title, action) {
        _super.call(this, title, action);
        this.title = title;
        this.async = action.length > 1;
    }
    ManualTest.prototype.invoke = function (callback) {
        var _this = this;
        // execute an async test
        if (this.async) {
            // test has indicated that it wants to handle the test loop
            var start = this.timer.start();
            this.action(this.count, function (err) {
                _this.clocked = _this.timer.stop(start);
                callback(err);
            });
            return;
        }
        // test has indicated that it wants to handle the test loop
        var start = this.timer.start();
        this.action(this.count);
        this.clocked = this.timer.stop(start);
        callback();
    };
    return ManualTest;
})(Test);
module.exports = ManualTest;
//# sourceMappingURL=manualTest.js.map