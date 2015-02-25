import ReporterBase = require("./reporterBase");
import Suite = require("../suite");
import Test = require("../test");
import util = require("util");

interface SuiteState {
    printed: boolean;
    suite: Suite;
}

/**
 * Minimal reporter. Only reports results for tests that have changed from baseline.
 */
class MinimalReporter extends ReporterBase {

    private _tests = 0;
    private _pending = 0;
    private _faster = 0;
    private _slower = 0;

    private _state: SuiteState[] = [];

    start(baselineTimestamp: Date): void {
        this.newLine();
    }

    end(): void {

        this.carriageReturn();
        if(this._faster || this._slower) {
            this.writeLine("         ");
        }
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
    }

    suiteStart(suite: Suite): void {
        if(suite.title) {
            this._state.push({ printed: false, suite: suite });
        }
    }

    suiteEnd(suite: Suite): void {
        if(suite.title) {
            this._state.pop();
        }
    }

    pending(test: Test): void {
        this._pending++;
    }

    testEnd(test: Test, percentChange: number): void {
        if(!this._state[this._state.length-1].suite.compare) {
            if (percentChange) {
                this.carriageReturn();

                // print suites for current test
                for (var i = 0, l = this._state.length; i < l; i++) {
                    var state = this._state[i];
                    if(state.printed) break;
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
    }

    cycle(test: Test): void {
        this.carriageReturn();
        this.write(test.title + " x " + this.formatNumber(test.hz) + " ops/sec (" + test.cycles + " runs sampled)");
    }

    private _formatResult(test: Test): string {
        return this.formatNumber(test.hz) + " ops/sec \xb1" + test.rme.toFixed(2) + "%";
    }

    private _indent(indents: number) {
        var ret = "";
        for (var i = 0; i < indents; i++) {
            ret += "  ";
        }
        return ret;
    }
}

export = MinimalReporter;