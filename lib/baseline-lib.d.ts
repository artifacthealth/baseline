declare module "baseline" {

    class Baseline {
        /**
         * A list of files to load. Glob patterns are allowed.
         */
        files: string[];
        /**
         * The Reporter to use.
         */
        reporter: Reporter;
        /**
         * The minimum percent difference from baseline that is reported as a change.
         */
        threshold: number;
        /**
         * The minimum percent confidence that the test has changed from baseline.
         */
        confidence: number;
        /**
         * The maximum time a test is allowed to run, in seconds, before finishing
         */
        maxTime: number;
        /**
         * Maximum execution time for an asynchronous action, in milliseconds.
         */
        timeout: number;
        /**
         * Full path to file to use for baseline.
         */
        baselinePath: string;
        /**
         * Indicates whether or not the baseline should be updated.
         */
        updateBaseline: boolean;
        /**
         * Indicates whether or not to use colors in reporter. If undefined, colors are used if supported.
         * in the terminal.
         */
        useColors: boolean;
        /**
         * The delay, in milliseconds, between asynchronous test cycles.
         */
        delay: number;
        /**
         * The root suite. Top level suites contained in 'files' are added to the root suite.
         */
        run(callback: ResultCallback<number>): void;
    }

    interface Callback {
        (err?: Error): void;
    }
    interface ResultCallback<T> extends Callback {
        (err?: Error, result?: T): void;
    }
    interface ActionCallback {
        (done?: Callback): void;
    }
    interface Lookup<T> {
        [name: string]: T;
    }

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

    /**
     * Minimal reporter. Only reports results for tests that have changed from baseline.
     */
    class MinimalReporter extends ReporterBase {
        start(timestamp: Date, duration?: number): void;
        end(): void;
        suiteStart(suite: Suite): void;
        suiteEnd(suite: Suite): void;
        pending(test: Test): void;
        testEnd(test: Test, percentChange: number): void;
        cycle(test: Test): void;
    }

    class DefaultReporter extends ReporterBase {
        start(timestamp: Date, duration?: number): void;
        end(): void;
        suiteStart(suite: Suite): void;
        suiteEnd(suite: Suite): void;
        testStart(test: Test): void;
        pending(test: Test): void;
        testEnd(test: Test, percentChange: number): void;
        cycle(test: Test): void;
        rank(test: Test, rank: number, percentSlower: number): void;
    }

    /**
     * Class that represents a benchmarking test.
     */
    class Test extends Runnable {
        title: string;
        parent: Suite;
        /**
         * The number of times a test was executed.
         */
        count: number;
        /**
         * The number of cycles performed while benchmarking.
         */
        cycles: number;
        /**
         * The number of executions per second.
         */
        hz: number;
        /**
         * The relative margin of error (expressed as a percentage of the mean.)
         */
        rme: number;
        /**
         * The margin of error.
         */
        moe: number;
        /**
         * The sample arithmetic mean (secs).
         */
        mean: number;
        /**
         * The array of sample periods.
         */
        sample: number[];
        /**
         * A timestamp of when the benchmark started.
         */
        timestamp: Date;
        /**
         * Time taken to complete the last test cycle, in seconds.
         */
        clocked: number;
        /**
         * The timer to use when running the test.
         */
        timer: Timer;
        /**
         * Indicates if the test is pending.
         */
        pending: boolean;
        /**
         * Gets the Hz, i.e. operations per second, of `test` adjusted for the margin of error.
         */
        adjustedHz: number;
        constructor(title: string, action?: ActionCallback);
        /**
         * Gets a test ready for evaluation
         * @param timer The timer to use when clocking the test.
         */
        setup(timer: Timer): void;
        /**
         * Determines if a test is faster than another benchmark.
         * @param other The test to compare.
         * @returns Returns '-1' if slower than 'other', '1' if faster than 'other', and '0' if indeterminate.
         */
        compare(other: Test): number;
        protected invoke(callback: Callback): void;
    }

    class Suite {
        title: string;
        parent: Suite;
        tests: Test[];
        suites: Suite[];
        before: Runnable[];
        after: Runnable[];
        beforeEach: Runnable[];
        afterEach: Runnable[];
        compare: boolean;
        /**
         * Indicates if the suite is pending.
         */
        pending: boolean;
        testCount: number;
        constructor(title?: string);
        addSuite(suite: Suite): void;
        addTest(test: Test): void;
        addBefore(action: ActionCallback): void;
        addAfter(action: ActionCallback): void;
        addBeforeEach(action: ActionCallback): void;
        addAfterEach(action: ActionCallback): void;
        filter(callback: ((value: Test, index?: number, array?: Test[]) => boolean) | string, thisArg?: any): Test[];
    }

    class ReporterBase implements Reporter {
        /**
         * Indicates whether or not to use colors in reporter. If undefined, colors are used if supported
         * in the terminal.
         */
        useColors: boolean;
        start(timestamp: Date, duration?: number): void;
        end(): void;
        suiteStart(suite: Suite): void;
        suiteEnd(suite: Suite): void;
        testStart(test: Test): void;
        pending(test: Test): void;
        testEnd(test: Test, percentChange: number): void;
        cycle(test: Test): void;
        rank(test: Test, rank: number, percentSlower: number): void;
        /**
         * Converts a number to a more readable comma-separated string representation.
         * @param value The number to convert.
         */
        protected formatNumber(value: number): string;
        static colors: Lookup<number>;
        protected color(type: string, str: string): string;
        protected writeLine(text: string): void;
        protected newLine(): void;
        protected carriageReturn(): void;
        protected write(text: string): void;
    }

    /**
     * Class for running an action. Handles both synchronous and asynchronous actions.
     */
    class Runnable {
        protected action: ActionCallback;
        /**
         * Maximum execution time for the action in milliseconds.
         */
        timeout: number;
        /**
         * True if the action timed out.
         */
        timedOut: boolean;
        protected async: boolean;
        constructor(action: ActionCallback);
        /**
         * Runs the action.
         * @param callback Function called after action completes.
         */
        run(callback: Callback): void;
        protected invoke(callback: Callback): void;
    }

    class Timer {
        /**
         * Starts a timer. Returns a value that should be passed to 'stop' in order to get the duration.
         */
        start(): any;
        /**
         * Stops a timer. Returns the duration in seconds.
         * @param start The value returned from 'start'.
         */
        stop(start: any): number;
        /**
         * The smallest unit the timer can measure.
         */
        resolution: number;
    }

    export = Baseline;
}
