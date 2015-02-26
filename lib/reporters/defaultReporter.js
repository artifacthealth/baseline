var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ReporterBase = require("./reporterBase");
var DefaultReporter = (function (_super) {
    __extends(DefaultReporter, _super);
    function DefaultReporter() {
        _super.apply(this, arguments);
        this._indents = 0;
        this._tests = 0;
        this._pending = 0;
        this._faster = 0;
        this._slower = 0;
    }
    DefaultReporter.prototype.start = function (baselineTimestamp) {
        if (baselineTimestamp) {
            this.writeLine("Tests will be compared to baseline established on " + baselineTimestamp.toLocaleDateString() + " at " + baselineTimestamp.toLocaleTimeString() + ".");
            this.newLine();
        }
    };
    DefaultReporter.prototype.end = function () {
        this.newLine();
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
    };
    DefaultReporter.prototype.suiteStart = function (suite) {
        this._suite = suite;
        if (!suite.title)
            return;
        this.writeLine(this.color("suite", this._indent() + suite.title));
        ++this._indents;
    };
    DefaultReporter.prototype.suiteEnd = function (suite) {
        if (!suite.title)
            return;
        --this._indents;
        this.newLine();
    };
    DefaultReporter.prototype.testStart = function (test) {
    };
    DefaultReporter.prototype.pending = function (test) {
        this.writeLine(this.color("pending", this._indent() + test.title));
        this._pending++;
    };
    DefaultReporter.prototype.testEnd = function (test, percentChange) {
        if (!this._suite.compare) {
            this.carriageReturn();
            this._writeTestName(test);
            if (!percentChange) {
                this.writeLine(this.color("test", this._formatResult(test)));
            }
            else if (percentChange > 0) {
                this.writeLine(this.color("faster", this._formatResult(test) + " (" + this.formatNumber(percentChange) + "% faster than baseline)"));
                this._faster++;
            }
            else {
                this.writeLine(this.color("slower", this._formatResult(test) + " (" + this.formatNumber(Math.abs(percentChange)) + "% slower than baseline)"));
                this._slower++;
            }
        }
        this._tests++;
    };
    DefaultReporter.prototype.cycle = function (test) {
        this.carriageReturn();
        this.write(this._indent() + test.title + " x " + this.formatNumber(test.hz) + " ops/sec (" + test.cycles + " runs sampled)");
    };
    DefaultReporter.prototype.rank = function (test, rank, percentSlower) {
        var color = rank == 1 ? "fastest" : rank == -1 ? "slowest" : "in-between";
        var rankText = rank == 1 ? "fastest" : percentSlower ? this.formatNumber(percentSlower) + "% slower" : "";
        this.carriageReturn();
        this._writeTestName(test);
        this.writeLine(this.color(color, this._formatResult(test) + " (" + rankText + ")"));
    };
    DefaultReporter.prototype._writeTestName = function (test) {
        this.write(this.color("test", this._indent() + test.title + ": "));
    };
    DefaultReporter.prototype._formatResult = function (test) {
        return this.formatNumber(test.hz) + " ops/sec \xb1" + test.rme.toFixed(2) + "%";
    };
    DefaultReporter.prototype._indent = function () {
        var ret = "";
        for (var i = 0; i < this._indents; i++) {
            ret += "  ";
        }
        return ret;
    };
    return DefaultReporter;
})(ReporterBase);
module.exports = DefaultReporter;
//# sourceMappingURL=defaultReporter.js.map