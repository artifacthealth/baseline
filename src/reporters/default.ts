import Reporter = require("./../reporter");
import Suite = require("./../suite");
import Test = require("./../test");

class DefaultReporter implements Reporter {

    private _indents = 0;
    private _tests = 0;
    private _pending = 0;
    private _suite: Suite;

    start(): void {

    }

    end(): void {

        var msg = "Completed " + this._tests + " tests";
        if(this._pending > 0) {
            msg += ", " + Reporter.color("pending", this._pending + " pending");
        }
        msg += "."
        Reporter.writeLine(msg);
    }

    suiteStart(suite: Suite): void {
        this._suite = suite;
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

    testEnd(test: Test): void {
        if(!this._suite.compare) {
            Reporter.writeLine(Reporter.color("test", this._testResults(test)));
        }
        this._tests++;
    }

    cycle(test: Test): void {
        Reporter.write(this._indent() + test.title + " x " + Reporter.formatNumber(test.hz) + " ops/sec (" + test.cycles + " runs sampled)");
        Reporter.cursor.CR();
    }

    rank(test: Test, rank: string, edge: number): void {
        var color = edge == 1 ? "fastest" : edge == -1 ? "slowest" : "in-between";
        Reporter.writeLine(Reporter.color(color, this._testResults(test) + " " + rank));
    }

    private _testResults(test: Test): string {
        return this._indent() + test.title + ": " + Reporter.formatNumber(test.hz) + " ops/sec \xb1" + test.rme.toFixed(2) + "% (" + test.cycles + " runs sampled)";
    }

    private _indent() {
        return Array(this._indents).join("  ")
    }
}

export = DefaultReporter;