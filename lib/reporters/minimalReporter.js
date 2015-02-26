var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ReporterBase = require("./reporterBase");
/**
 * Minimal reporter. Only reports results for tests that have changed from baseline.
 */
var MinimalReporter = (function (_super) {
    __extends(MinimalReporter, _super);
    function MinimalReporter() {
        _super.apply(this, arguments);
        this._tests = 0;
        this._pending = 0;
        this._faster = 0;
        this._slower = 0;
        this._state = [];
    }
    MinimalReporter.prototype.start = function (baselineTimestamp) {
        this.newLine();
    };
    MinimalReporter.prototype.end = function () {
        this.carriageReturn();
        if (this._faster || this._slower) {
            this.writeLine("         ");
        }
        var msg = "Completed " + this._tests + " tests";
        if (this._pending > 0) {
            msg += ", " + this.color("pending", this._pending + " pending");
        }
        if (this._faster > 0) {
            msg += ", " + this.color("faster", this._faster + " faster");
        }
        if (this._slower > 0) {
            msg += ", " + this.color("slower", this._slower + " slower");
        }
        msg += ".";
        this.writeLine(msg);
        this.newLine();
    };
    MinimalReporter.prototype.suiteStart = function (suite) {
        if (suite.title) {
            this._state.push({ printed: false, suite: suite });
        }
    };
    MinimalReporter.prototype.suiteEnd = function (suite) {
        if (suite.title) {
            this._state.pop();
        }
    };
    MinimalReporter.prototype.pending = function (test) {
        this._pending++;
    };
    MinimalReporter.prototype.testEnd = function (test, percentChange) {
        if (!this._state[this._state.length - 1].suite.compare) {
            if (percentChange) {
                this.carriageReturn();
                for (var i = 0, l = this._state.length; i < l; i++) {
                    var state = this._state[i];
                    if (state.printed)
                        break;
                    this.writeLine(this.color("suite", this._indent(i) + state.suite.title));
                    state.printed = true;
                }
                this.write(this.color("test", this._indent(this._state.length) + test.title + ": "));
                if (percentChange > 0) {
                    this.writeLine(this.color("faster", this._formatResult(test) + " (" + this.formatNumber(percentChange) + "% faster than baseline)"));
                    this._faster++;
                }
                else {
                    this.writeLine(this.color("slower", this._formatResult(test) + " (" + this.formatNumber(Math.abs(percentChange)) + "% slower than baseline)"));
                    this._slower++;
                }
            }
        }
        this._tests++;
    };
    MinimalReporter.prototype.cycle = function (test) {
        this.carriageReturn();
        this.write(test.title + " x " + this.formatNumber(test.hz) + " ops/sec (" + test.cycles + " runs sampled)");
    };
    MinimalReporter.prototype._formatResult = function (test) {
        return this.formatNumber(test.hz) + " ops/sec \xb1" + test.rme.toFixed(2) + "%";
    };
    MinimalReporter.prototype._indent = function (indents) {
        var ret = "";
        for (var i = 0; i < indents; i++) {
            ret += "  ";
        }
        return ret;
    };
    return MinimalReporter;
})(ReporterBase);
module.exports = MinimalReporter;
//# sourceMappingURL=minimalReporter.js.map