/// <reference path="./types.d.ts" />

import async = require("async");
import Test = require("./test");
import Action = require("./action");
import Evaluator = require("./evaluator");

class Suite {

    private _tests: Test[] = [];
    private _suites: Suite[] = [];
    private _before: Action[] = [];
    private _after: Action[] = [];
    private _beforeEach: Action[] = [];
    private _afterEach: Action[] = [];

    constructor(public title: string) {

    }

    addSuite(suite: Suite): void {
        this._suites.push(suite);
    }

    addTest(test: Test): void {
        this._tests.push(test);
    }

    addBefore(action: ActionCallback): void {
        this._before.push(new Action(action));
    }

    addAfter(action: ActionCallback): void {
        this._after.push(new Action(action));
    }

    addBeforeEach(action: ActionCallback): void {
        this._beforeEach.push(new Action(action));
    }

    addAfterEach(action: ActionCallback): void {
        this._afterEach.push(new Action(action));
    }

    run(evaluator: Evaluator, callback: Callback): void {

        // execute "before" hooks
        async.eachSeries(this._before, (action: Action, done: Callback) => action.run(done), (err: Error) => {
            if(err) return callback(err);

            // for each test
            async.eachSeries(this._tests, (test: Test, done: Callback) => {

                // initialize setup and teardown for the test
                test.setup = this._beforeEach;
                test.teardown = this._afterEach;

                // evaluate the test
                evaluator.evaluate(test, (err) => {

                    if(err) {
                        console.log(test.title + ": " + err.message + "\n" + (<any>err).stack);
                        done();
                        return;
                    }
                    console.log(test.title + ": " + formatNumberWithCommas(test.hz, 2) + " \xb1" + test.rme.toFixed(2) + "% ops/sec");
                    done();
                });
            }, (err) => {

                // execute any other suites
                async.eachSeries(this._suites, (suite: Suite, done: Callback) => suite.run(evaluator, done), (err) => {
                    if (err) return callback(err);

                    // execute "after" hooks
                    async.eachSeries(this._after, (action: Action, done: Callback) => action.run(done), callback);
                });
            });
        });
    }
}

// http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function formatNumberWithCommas(x: number, digits: number) {
    var parts = x.toFixed(digits).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export = Suite;