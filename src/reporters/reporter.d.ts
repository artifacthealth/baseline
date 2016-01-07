import Suite = require("../suite");
import Test = require("../test");

/**
 * Reporter interface.
 */
interface Reporter {

    /**
     * Indicates whether or not to use colors in reporter. If undefined, colors are used if supported
     * in the terminal.
     */
    useColors: boolean;

    /**
     * Called at start.
     * @param timestamp When comparing to a baseline, contains the timestamp of the baseline; otherwise, undefined.
     * @param duration When updating a baseline, contains the estimated time it will take in seconds; otherwise, undefined.
     */
    start(timestamp: Date, duration?: number): void;

    /**
     * Called at end.
     */
    end(): void;

    /**
     * Called when a suite starts.
     * @param suite The suite.
     */
    suiteStart(suite: Suite): void;

    /**
     * Called when a suite ends.
     * @param suite The suite.
     */
    suiteEnd(suite: Suite): void;

    /**
     * Called at the conclusion of a comparison suite once for each test reporting the ranking.
     * @param test The test.
     * @param rank Has a value of '1' to indicate the test is the fastest, '-1' to indicate it's the slowest,
     * or '0' to indicate it's in-between.
     * @param percentSlower The percent slower than the fastest test.
     */
    rank(test: Test, rank: number, percentSlower: number): void;

    /**
     * Called for pending tests.
     * @param test The test.
     */
    pending(test: Test): void;

    /**
     * Called when a test starts.
     * @param test The test.
     */
    testStart(test: Test): void;

    /**
     * Called at the conclusion of each test cycle.
     * @param test The test.
     */
    cycle(test: Test): void;

    /**
     * Called when a test ends.
     * @param test The test.
     */
    testEnd(test: Test, percentChange: number): void;
}

export = Reporter;