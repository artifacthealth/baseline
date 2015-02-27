/// <reference path="../typings/mocha.d.ts"/>
/// <reference path="../typings/chai.d.ts"/>

import chai = require("chai");
import assert = chai.assert;
import NodeTimer = require("../src/nodeTimer");
import Test = require("../src/test");

describe('Test', () => {

    describe('run', () => {

        it("executes a synchronous action 'count' times and sets 'clocked' with the elapsed time", (done) => {

            var called = 0;
            var test = new Test('the test', () => {
                called++;
            });

            test.timer = new NodeTimer();
            test.count = 100;

            test.run((err) => {
                if(err) return done(err);
                assert.equal(called, 100);
                assert.ok(test.clocked);
                done();
            });
        });

        it("executes an asynchronous action 'count' times and sets 'clocked' with the elapsed time", (done) => {

            var called = 0;
            var test = new Test('the test', (done) => {
                process.nextTick(() => {
                    called++;
                    done();
                });
            });

            test.timer = new NodeTimer();
            test.count = 100;

            test.run((err) => {
                if(err) return done(err);
                assert.equal(called, 100);
                assert.ok(test.clocked);
                done();
            });
        });
    });
});