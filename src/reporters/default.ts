import Reporter = require("../reporter");
import Suite = require("../suite");
import Test = require("../test");

class DefaultReporter implements Reporter {

    private _indents = 0;
    private _tests = 0;
    private _pending = 0;
    private _faster = 0;
    private _slower = 0;
    private _suite: Suite;

    private _nameColumn = 35;
    private _currentColumn = 20;
    private _baselineColumn = 20;

    start(baselineTimestamp: Date): void {

        if(baselineTimestamp) {
            Reporter.writeLine("Tests will be compared to baseline established on " + baselineTimestamp.toLocaleDateString() + " at " + baselineTimestamp.toLocaleTimeString() + ".");
            Reporter.newLine();
        }
    }

    end(): void {

        Reporter.newLine();
        var msg = "Completed " + this._tests + " tests";
        if(this._pending > 0) {
            msg += ", " + Reporter.color("pending", this._pending + " pending");
        }
        if(this._faster > 0) {
            msg += ", " + Reporter.color("faster", this._faster + " faster");
        }
        if(this._slower > 0) {
            msg += ", " + Reporter.color("slower", this._slower + " slower");
        }
        msg += "."
        Reporter.writeLine(msg);
    }

    suiteStart(suite: Suite): void {
        this._suite = suite;
        if(!suite.title) return;
        Reporter.writeLine(Reporter.color("suite", this._indent() + suite.title));
        ++this._indents;
    }

    suiteEnd(suite: Suite): void {
        --this._indents;
        if (1 == this._indents) Reporter.newLine();
    }

    testStart(test: Test): void {
    }

    pending(test: Test): void {
        Reporter.writeLine(Reporter.color("pending",  this._indent() + test.title));
        this._pending++;
    }

    testEnd(test: Test, percentChange: number): void {
        if(!this._suite.compare) {
            Reporter.cursor.carriageReturn();
            this._writeTestName(test);
            if (!percentChange) {
                Reporter.writeLine(Reporter.color("test", this._formatResult(test)));
            }
            else if (percentChange > 0) {
                Reporter.writeLine(Reporter.color("faster", this._formatResult(test) + " (" + Reporter.formatNumber(percentChange) + "% faster than baseline)"));
                this._faster++;
            }
            else {
                Reporter.writeLine(Reporter.color("slower", this._formatResult(test) + " (" + Reporter.formatNumber(Math.abs(percentChange)) + "% slower than baseline)"));
                this._slower++;
            }
        }
        this._tests++;
    }

    cycle(test: Test): void {
        Reporter.cursor.carriageReturn();
        Reporter.write(this._indent() + test.title + " x " + Reporter.formatNumber(test.hz) + " ops/sec (" + test.cycles + " runs sampled)");
    }

    rank(test: Test, rank: number, percentSlower: number): void {

        var color = rank == 1 ? "fastest" : rank == -1 ? "slowest" : "in-between";
        var rankText = rank == 1 ? "fastest" : percentSlower ? Reporter.formatNumber(percentSlower) + "% slower": "";

        this._writeTestName(test);
        Reporter.writeLine(Reporter.color(color, this._formatResult(test) + " " + rankText));
    }

    private _writeTestName(test: Test): void {
        Reporter.write(Reporter.color("test", this._indent() + test.title + ": "));
    }

    private _formatResult(test: Test): string {
        return Reporter.formatNumber(test.hz) + " ops/sec \xb1" + test.rme.toFixed(2) + "%";
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