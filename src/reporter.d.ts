import Suite = require("./suite");
import Test = require("./test");

interface Reporter {

    start(): void;
    end(): void;
    suiteStart(suite: Suite): void;
    suiteEnd(suite: Suite): void;
    testStart(test: Test): void;
    testEnd(test: Test): void;
    skip(test: Test): void;
}

export = Reporter;