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

/// <reference path="../types.d.ts" />
/// <reference path="../../typings/supports-color.d.ts" />
import tty = require('tty');
import supportsColor = require("supports-color");

import Reporter = require("./reporter");
import Suite = require("../suite");
import Test = require("../test");

var isatty = tty.isatty(1) && tty.isatty(2);

class ReporterBase implements Reporter {

    /**
     * Indicates whether or not to use colors in reporter. If undefined, colors are used if supported
     * in the terminal.
     */
    useColors: boolean;

    start(timestamp: Date, duration?: number): void {
    }

    end(): void {
    }

    suiteStart(suite: Suite): void {
    }

    suiteEnd(suite: Suite): void {
    }

    testStart(test: Test): void {
    }

    pending(test: Test): void {
    }

    testEnd(test: Test, percentChange: number): void {
    }

    cycle(test: Test): void {
    }

    rank(test: Test, rank: number, percentSlower: number): void {
    }

    /**
     * Converts a number to a more readable comma-separated string representation.
     * @param value The number to convert.
     */
    protected formatNumber(value: number): string {
        var parts = String(value < 1 ? value.toFixed(2) : Math.round(value)).split('.');
        return parts[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') +
            (parts[1] ? '.' + parts[1] : '');
    }

    static colors: Lookup<number> = {
        'in-between': 0,
        'fastest': 32,
        'slowest': 31,
        'suite': 0,
        'test': 0,
        'pending': 36,
        'faster': 32,
        'slower': 31
    }

    protected color(type: string, str: string): string {

        if ((this.useColors === undefined && !supportsColor) || this.useColors === false) return str;
        return '\u001b[' + ReporterBase.colors[type] + 'm' + str + '\u001b[0m';
    }

    protected writeLine(text: string): void {
        this.write(text);
        this.newLine();
    }

    protected newLine(): void {
        this.write("\n");
    }

    protected carriageReturn() {
        if (isatty) {
            this.write('\u001b[2K');
            this.write('\u001b[0G')
        } else {
            this.write('\r');
        }
    }

    protected write(text: string): void {
        process.stdout.write(text);
    }

}

export = ReporterBase;