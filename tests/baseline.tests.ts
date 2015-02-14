/// <reference path="../typings/mocha.d.ts"/>
/// <reference path="../typings/chai.d.ts"/>

import chai = require("chai");
import assert = chai.assert;
import baseline = require("../src/baseline");
import NodeTimer = require("../src/nodeTimer");
import Evaluator = require("../src/evaluator");

describe('Baseline', () => {

    it('', (done) => {

        var suite = baseline.suite("Some test suite", () => {

            var value = true;
            baseline.test("!", () => {
              //  !value;
            });
            baseline.test("!!!", () => {
              //  !!!value;
            });
        });

        var evaluator = new Evaluator(new NodeTimer());
        evaluator.maxTime = 5;

        suite.run(evaluator, done);
    });
});