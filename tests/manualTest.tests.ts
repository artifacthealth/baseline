/// <reference path="../typings/mocha.d.ts"/>
/// <reference path="../typings/chai.d.ts"/>

import chai = require("chai");
import assert = chai.assert;
import NodeTimer = require("../src/nodeTimer");
import ManualTest = require("../src/manualTest");

describe('ManualTest', () => {

    describe('run', () => {

        it("passes 'count' to callback for synchronous test", (done) => {

            var called = 0;
            var test = new ManualTest('the test', (count) => {
                assert.equal(count, 100);
                called++;
            });

            test.timer = new NodeTimer();
            test.count = 100;

            test.run((err) => {
                if(err) return done(err);
                assert.equal(called, 1);
                assert.ok(test.clocked);
                done();
            });
        });

        it("passes 'count' to callback for asynchronous test", (done) => {

            var called = 0;
            var test = new ManualTest('the test', (count: number, done: Callback) => {
                assert.equal(count, 100);
                process.nextTick(() => {
                    called++;
                    done();
                });
            });

            test.timer = new NodeTimer();
            test.count = 100;

            test.run((err) => {
                if(err) return done(err);
                assert.equal(called, 1);
                assert.ok(test.clocked);
                done();
            });
        });
    });
});