import ReporterBase = require("./reporterBase");
import Suite = require("../suite");
import Test = require("../test");
import util = require("util");

class DefaultReporter extends ReporterBase {

    private _indents = 0;
    private _tests = 0;
    private _pending = 0;
    private _faster = 0;
    private _slower = 0;
    private _suite: Suite;

    start(baselineTimestamp: Date): void {

        this.newLine();
        if(baselineTimestamp) {
            this.writeLine("Tests will be compared to baseline established on " + baselineTimestamp.toLocaleDateString()
                                + " at " + baselineTimestamp.toLocaleTimeString() + ".");
            this.newLine();
        }
    }

    end(): void {

        var msg = "Completed " + this._tests + " tests";
        if(this._pending > 0) {
            msg += ", " + this.color("pending", this._pending + " pending");
        }
        if(this._faster > 0) {
            msg += ", " + this.color("faster", this._faster + " faster");
        }
        if(this._slower > 0) {
            msg += ", " + this.color("slower", this._slower + " slower");
        }
        msg += "."
        this.writeLine(msg);
        this.newLine();
    }

    suiteStart(suite: Suite): void {
        this._suite = suite;
        if(!suite.title) return;
        this.writeLine(this.color("suite", this._indent() + suite.title));
        ++this._indents;
    }

    suiteEnd(suite: Suite): void {
        if(!suite.title) return;
        --this._indents;
        this.newLine();
    }

    testStart(test: Test): void {
    }

    pending(test: Test): void {
        this.writeLine(this.color("pending",  this._indent() + test.title));
        this._pending++;
    }

    testEnd(test: Test, percentChange: number): void {
        if(!this._suite.compare) {
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
    }

    cycle(test: Test): void {
        this.carriageReturn();
        this.write(this._indent() + test.title + " x " + this.formatNumber(test.hz) + " ops/sec (" + test.cycles + " runs sampled)");
    }

    rank(test: Test, rank: number, percentSlower: number): void {

        var color = rank == 1 ? "fastest" : rank == -1 ? "slowest" : "in-between";
        var rankText = rank == 1 ? "fastest" : percentSlower ? this.formatNumber(percentSlower) + "% slower": "";

        this.carriageReturn();
        this._writeTestName(test);
        this.writeLine(this.color(color, this._formatResult(test) + " (" + rankText + ")"));
    }

    private _writeTestName(test: Test): void {
        this.write(this.color("test", this._indent() + test.title + ": "));
    }

    private _formatResult(test: Test): string {
        return this.formatNumber(test.hz) + " ops/sec \xb1" + test.rme.toFixed(2) + "%";
    }

    private _indent() {
        var ret = "";
        for (var i = 0; i < this._indents; i++) {
            ret += "  ";
        }
        return ret;
    }
}

export = DefaultReporter;