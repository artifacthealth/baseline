declare module "baseline" {

    class Baseline {

        /**
         * A list of files to load. Glob patterns are allowed.
         */
        files: string[];

        /**
         * The Reporter to use.
         */
        reporter: Baseline.Reporter;

        /**
         * The minimum percent difference from baseline that is reported as a change.
         */
        threshold: number;

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

        run(callback: Baseline.ResultCallback<number>): void;
    }

    module Baseline {

        /**
         * Reporter interface.
         */
        export interface Reporter {

            /**
             * Indicates whether or not to use colors in reporter. If undefined, colors are used if supported
             * in the terminal.
             */
            useColors: boolean;

            /**
             * Called at start.
             */
            start(baselineTimestamp: Date): void;

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
         * Interface that represents a test suite.
         */
        export interface Suite {

            /**
             * The Tests contained within the suite.
             */
            tests: Test[];

            /**
             * The Suites contained within the suite.
             */
            suites: Suite[];

            /**
             * True if the Suite is a comparison suite; otherwise, false.
             */
            compare: boolean;

            /**
             * Indicates if the Suite is pending.
             */
            pending: boolean;

            /**
             * Adds a suite.
             * @param suite The suite to add.
             */
            addSuite(suite: Suite): void;

            /**
             * Adds a test.
             * @param test The test to add.
             */
            addTest(test: Test): void;

            /**
             * Adds a before hook.
             * @param action The action to execute before the suite starts.
             */
            addBefore(action: ActionCallback): void;

            /**
             * Adds an after hook.
             * @param action The action to execute after the suite finishes.
             */
            addAfter(action: ActionCallback): void;

            /**
             * Adds an beforeEach hook.
             * @param action The action to execute before each test starts.
             */
            addBeforeEach(action: ActionCallback): void;

            /**
             * Adds an afterEach hook.
             * @param action The action to execute after each test finishes.
             */
            addAfterEach(action: ActionCallback): void;
        }

        /**
         * Interface that represents a benchmarking test.
         */
        export interface Test {

            /**
             * The Suite that contains the test.
             */
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
             * Indicates if the test is pending.
             */
            pending: boolean;

            /**
             * Maximum execution time for the test in milliseconds.
             */
            timeout: number;

            /**
             * True if the test timed out.
             */
            timedOut: boolean;

            /**
             * Runs the test.
             * @param callback Function called after test completes.
             */
            run(callback: Callback): void;

            /**
             * Determines if a test is faster than another benchmark.
             * @param other The test to compare.
             * @returns Returns '-1' if slower than 'other', '1' if faster than 'other', and '0' if indeterminate.
             */
            compare(other: Test): number;
        }

        /**
         * The default reporter. Outputs results for each test.
         */
        export class DefaultReporter implements Reporter {

            /**
             * Indicates whether or not to use colors in reporter. If undefined, colors are used if supported
             * in the terminal.
             */
            useColors: boolean;

            /**
             * Called at start.
             */
            start(baselineTimestamp: Date): void;

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
         * The minimal reporter. Only outputs results for tests that have changed from baseline. Otherwise, only the
         * summary is reported.
         */
        export class MinimalReporter implements Reporter {

            /**
             * Indicates whether or not to use colors in reporter. If undefined, colors are used if supported
             * in the terminal.
             */
            useColors: boolean;

            /**
             * Called at start.
             */
            start(baselineTimestamp: Date): void;

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

        export interface Callback {
            (err?: Error): void;
        }

        export interface ResultCallback<T> extends Callback {
            (err?: Error, result?: T): void;
        }

        export interface ActionCallback {
            (done?: Callback): void;
        }
    }

    export = Baseline;
}