/// <reference path="./types.d.ts" />

import Suite = require("./suite");
import Test = require("./test");

module Baseline {

    var suites: Suite[];

    export function suite(title: string, block: () => void): Suite {

        var suite = new Suite(title);

        if(!suites) {
            suites = [];
        }
        else {
            var parent = suites[0];
            parent.addSuite(suite);
        }

        suites.unshift(suite);
        block.call(suite);
        suites.shift();

        function done(err: Error): void {
            console.log("Finished");
        }

        if(!parent) {
            suites = undefined;
        }

        return suite;
    }

    export function test(title: string, action: ActionCallback): void {
        suites[0].addTest(new Test(title, action));
    }

    export function after(action: ActionCallback): void {
        suites[0].addAfter(action);
    }

    export function before(action: ActionCallback): void {
        suites[0].addBefore(action);
    }

    export function afterEach(action: ActionCallback): void {
        suites[0].addAfterEach(action);
    }

    export function beforeEach(action: ActionCallback): void {
        suites[0].addBeforeEach(action);
    }
}

export = Baseline;