/*!
 * The code for the 'filter' function is a modified version of code
 * originally from Benchmark.js. Original Copyright follows.
 *
 * Benchmark.js v2.0.0-pre <http://benchmarkjs.com/>
 * Copyright 2010-2015 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */

/// <reference path="./types.d.ts" />

import Test = require("./test");
import Runnable = require("./runnable");

class Suite {

    parent: Suite;

    tests: Test[] = [];
    suites: Suite[] = [];

    before: Runnable[] = [];
    after: Runnable[] = [];
    beforeEach: Runnable[] = [];
    afterEach: Runnable[] = [];

    compare: boolean;

    /**
     * Indicates if the suite is pending.
     */
    get pending(): boolean {
        return this._pending || (this.parent && this.parent.pending);
    }

    set pending(value: boolean) {
        this._pending = value;
    }

    private _pending: boolean;

    constructor(public title: string = "") {

    }

    addSuite(suite: Suite): void {
        this.suites.push(suite);
        suite.parent = this;
    }

    addTest(test: Test): void {
        this.tests.push(test);
        test.parent = this;
    }

    addBefore(action: ActionCallback): void {
        this.before.push(new Runnable(action));
    }

    addAfter(action: ActionCallback): void {
        this.after.push(new Runnable(action));
    }

    addBeforeEach(action: ActionCallback): void {
        this.beforeEach.push(new Runnable(action));
    }

    addAfterEach(action: ActionCallback): void {
        this.afterEach.push(new Runnable(action));
    }

    filter(callback: ((value: Test, index?: number, array?: Test[]) => boolean) | string, thisArg?: any): Test[] {

        if(typeof callback == "string") {
            if (callback === 'successful') {
                // Callback to exclude those that are errored, unrun, or have hz of Infinity.
                callback = function (test: Test) {
                    return test.cycles && isFinite(test.hz);
                };
            }
            else if (callback === 'fastest' || callback === 'slowest') {
                // Get successful, sort by period + margin of error, and filter fastest/slowest.
                var result = this.filter('successful').sort(function (a, b) {
                    return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback === 'fastest' ? 1 : -1);
                });
                return result.filter(function (test) {
                    return result[0].compare(test) == 0;
                });
            }
        }

        return this.tests.filter(<(value: Test, index?: number, array?: Test[]) => boolean>callback, thisArg);
    }
}

export = Suite;
