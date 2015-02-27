/// <reference path="../typings/mocha.d.ts"/>
/// <reference path="../typings/chai.d.ts"/>

import chai = require("chai");
import assert = chai.assert;
import NodeTimer = require("../src/nodeTimer");

describe('NodeTimer', () => {

    describe('stop', () => {

        it('returns the elapsed time in seconds', (done) => {

            var timer = new NodeTimer();
            var start = timer.start();
            setTimeout(() => {
                var elapsed = timer.stop(start);
                assert.equal(elapsed.toFixed(1), 0.1);
                done();
            }, 100);
        })
    });
});