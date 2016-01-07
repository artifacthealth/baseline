/// <reference path="../typings/mocha.d.ts"/>
/// <reference path="../typings/chai.d.ts"/>

import chai = require("chai");
import assert = chai.assert;
import Random = require("../src/random");

describe('Random', () => {

    describe('integer', () => {

        it("returns a random integer in the specified range", () => {

            assertInRange(0, 4);
            assertInRange(0, 51);
            assertInRange(-10, 10);
            assertInRange(-10, 11);

            function assertInRange(min: number, max: number): void {

                for(var i = 0; i < 1000; i++) {
                    var value = Random.integer(min, max);
                    assert.isTrue(value >= min);
                    assert.isTrue(value <= max);
                }
            }

        });
    });
});