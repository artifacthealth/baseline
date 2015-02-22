/// <reference path="./types.d.ts" />

import async = require("async");
import Test = require("./test");
import Runnable = require("./runnable");

class Suite {

    tests: Test[] = [];
    suites: Suite[] = [];

    before: Runnable[] = [];
    after: Runnable[] = [];
    beforeEach: Runnable[] = [];
    afterEach: Runnable[] = [];

    /**
     * Indicates if the suite is skipped.
     */
    skip: boolean;

    constructor(public title: string = "") {

    }

    addSuite(suite: Suite): void {
        this.suites.push(suite);
    }

    addTest(test: Test): void {
        this.tests.push(test);
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
}

export = Suite;
