/// <reference path="../typings/mocha.d.ts"/>
/// <reference path="../typings/chai.d.ts"/>

import chai = require("chai");
import assert = chai.assert;
import Runnable = require("../src/runnable");

describe('Runnable', () => {

    describe('run', () => {

        it('is able to run a synchronous action', (done) => {

            var called = 0;
            var runnable = new Runnable(() => {
                called++;
            });

            runnable.run((err) => {
                if(err) return done(err);
                assert.equal(called, 1);
                done();
            });
        });

        it('is able to run an asynchronous action', (done) => {

            var called = 0;
            var runnable = new Runnable((done) => {
                process.nextTick(() => {
                    called++;
                    done();
                })
            });

            runnable.run((err) => {
                if(err) return done(err);
                assert.equal(called, 1);
                done();
            });
        });

        it('passes error returned from action to the callback', (done) => {

            var runnable = new Runnable((done) => {
                done(new Error("test"));
            });

            runnable.run((err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, "test");
                done();
            });
        });

        it('returns an error for asynchronous tests if timeout is exceeded', (done) => {

            var runnable = new Runnable((done) => {

                setTimeout(done, 100);
            });

            runnable.timeout = 1;

            runnable.run((err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, 'timeout of 1ms exceeded. Ensure the done() callback is being called in this test.');
                done();
            });
        });
    });
});