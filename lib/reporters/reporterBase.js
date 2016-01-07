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
var tty = require('tty');
var supportsColor = require("supports-color");
var isatty = tty.isatty(1) && tty.isatty(2);
var ReporterBase = (function () {
    function ReporterBase() {
    }
    ReporterBase.prototype.start = function (baselineTimestamp) {
    };
    ReporterBase.prototype.end = function () {
    };
    ReporterBase.prototype.suiteStart = function (suite) {
    };
    ReporterBase.prototype.suiteEnd = function (suite) {
    };
    ReporterBase.prototype.testStart = function (test) {
    };
    ReporterBase.prototype.pending = function (test) {
    };
    ReporterBase.prototype.testEnd = function (test, percentChange) {
    };
    ReporterBase.prototype.cycle = function (test) {
    };
    ReporterBase.prototype.rank = function (test, rank, percentSlower) {
    };
    /**
     * Converts a number to a more readable comma-separated string representation.
     * @param value The number to convert.
     */
    ReporterBase.prototype.formatNumber = function (value) {
        var parts = String(value < 1 ? value.toFixed(2) : Math.round(value)).split('.');
        return parts[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') + (parts[1] ? '.' + parts[1] : '');
    };
    ReporterBase.prototype.color = function (type, str) {
        if ((this.useColors === undefined && !supportsColor) || this.useColors === false)
            return str;
        return '\u001b[' + ReporterBase.colors[type] + 'm' + str + '\u001b[0m';
    };
    ReporterBase.prototype.writeLine = function (text) {
        this.write(text);
        this.newLine();
    };
    ReporterBase.prototype.newLine = function () {
        this.write("\n");
    };
    ReporterBase.prototype.carriageReturn = function () {
        if (isatty) {
            this.write('\u001b[2K');
            this.write('\u001b[0G');
        }
        else {
            this.write('\r');
        }
    };
    ReporterBase.prototype.write = function (text) {
        process.stdout.write(text);
    };
    ReporterBase.colors = {
        'in-between': 0,
        'fastest': 32,
        'slowest': 31,
        'suite': 0,
        'test': 0,
        'pending': 36,
        'faster': 32,
        'slower': 31
    };
    return ReporterBase;
})();
module.exports = ReporterBase;
//# sourceMappingURL=reporterBase.js.map