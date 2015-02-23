/*!
 * The code for the 'formatNumber' function is a modified version of
 * code originally from Benchmark.js. Original Copyright follows.
 *
 * Benchmark.js v2.0.0-pre <http://benchmarkjs.com/>
 * Copyright 2010-2015 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */

/// <reference path="./types.d.ts" />
/// <reference path="../typings/supports-color.d.ts" />
import tty = require('tty');
import supportsColor = require("supports-color");

import Suite = require("./suite");
import Test = require("./test");

/**
 * Reporter interface.
 */
interface Reporter {
    /**
     * Called at start.
     */
    start(): void;

    /**
     * Called at end.
     */
    end(): void;

    /**
     * Called when a suite starts.
     * @param suite The suite.
     */
    suiteStart(suite: Suite): void;

    /**
     * Called when a suite ends.
     * @param suite The suite.
     */
    suiteEnd(suite: Suite): void;

    /**
     * Called at the conclusion of a comparison suite once for each test reporting the ranking.
     * @param test The test.
     * @param rank Description of the rank for the test.
     * @param edge Has a value of '1' to indicate the test is the fastest, '-1' to indicate it's the slowest,
     * or '0' to indicate it's in-between.
     */
    rank(test: Test, rank: string, edge: number): void;

    /**
     * Called for pending tests.
     * @param test The test.
     */
    pending(test: Test): void;

    /**
     * Called when a test starts.
     * @param test The test.
     */
    testStart(test: Test): void;

    /**
     * Called at the conclusion of each test cycle.
     * @param test The test.
     */
    cycle(test: Test): void;

    /**
     * Called when a test ends.
     * @param test The test.
     */
    testEnd(test: Test): void;
}

module Reporter {

    var isatty = tty.isatty(1) && tty.isatty(2);

    /**
     * Converts a number to a more readable comma-separated string representation.
     * @param value The number to convert.
     */
    export function formatNumber(value: number) {
        var parts = String(value < 1 ? value.toFixed(2) : Math.round(value)).split('.');
        return parts[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') +
            (parts[1] ? '.' + parts[1] : '');
    }

    export module cursor {

        export function hide() {
            isatty && process.stdout.write('\u001b[?25l');
        }

        export function show() {
            isatty && process.stdout.write('\u001b[?25h');
        }

        export function deleteLine() {
            isatty && process.stdout.write('\u001b[2K');
        }

        export function beginningOfLine() {
            isatty && process.stdout.write('\u001b[0G');
        }

        export function CR() {
            if (isatty) {
                cursor.beginningOfLine();
            } else {
                process.stdout.write('\r');
            }
        }
    }

    export var colors: Lookup<number> = {
        'in-between': 0,
        'fastest': 32,
        'slowest': 31,
        'suite': 0,
        'test': 0,
        'pending': 36
    }

    export function color(type: string, str: string): string {

        if (!supportsColor) return String(str);
        return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
    }

    export function writeLine(text: string): void {
        write(text);
        newLine();
    }

    export function newLine(): void {
        write("\n");
    }

    export function write(text: string): void {
        process.stdout.write(text);
    }
}

export = Reporter;