import Reporter = require("./reporter");
import Suite = require("./suite");
import Test = require("./test");

class StdoutReporter implements Reporter {

    start(): void {

    }

    end(): void {

    }

    suiteStart(suite: Suite): void {

    }

    suiteEnd(suite: Suite): void {

    }

    testStart(test: Test): void {

    }

    skip(test: Test): void {

    }

    testEnd(test: Test): void {

        console.log(test.title + ": " + formatNumberWithCommas(test.hz, 0) + " ops/sec \xb1" + test.rme.toFixed(2) + "% (" + test.cycles + " runs sampled)");
    }
}

// http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function formatNumberWithCommas(x: number, digits: number) {
    var parts = x.toFixed(digits).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


export = StdoutReporter;