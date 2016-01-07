/// <reference path="./types.d.ts" />

import fs = require("fs");
import Suite = require("./suite");
import Test = require("./test");
import Random = require("./random");

class Results {

    get timestamp(): Date {
        return this._results ? new Date(this._results.timestamp) : undefined;
    }

    private _results: SuiteResults;

    static fromSuite(suite: Suite): Results {

        var ret = new Results();
        ret._results = Results._getSuiteResults(suite);
        ret._results.timestamp = new Date().getTime()
        return ret;
    }

    static load(filename: string, callback: ResultCallback<Results>): void {

        Results._fileExists(filename, (exists) => {
            if(!exists) return callback();

            fs.readFile(filename, "utf8", (err: Error, data: string) => {
                if(err) return callback(err);

                var ret = new Results();
                ret._results = JSON.parse(data);
                callback(null, ret);
            });
        });
    }

    private static _fileExists(filename: string, callback: (exists: boolean) => void): void {

        if(!filename) return callback(false);
        fs.exists(filename, callback);
    }

    save(filename: string, callback: Callback): void {

        fs.writeFile(filename, JSON.stringify(this._results, null, "  "), "utf8", callback);
    }

    compare(test: Test, confidence: number): number {

        var baselineSample = this._getTestResults(this._getPath(test));
        if (!baselineSample) return;

        if (typeof baselineSample == "number") {
            // old data format where we just stored the adjusted hz
            return this._percentChange(baselineSample, test.adjustedHz);
        }

        if (!Array.isArray(baselineSample)) return;

        var distribution = this._resample(baselineSample, test.sample.length);

        var offset = distribution.length * ((100 - confidence) / 100.0);
        var lowerLimit = distribution[Math.ceil(offset)];
        var upperLimit = distribution[Math.floor(distribution.length - (offset + 1))];

        var hz = Results.round(test.hz);

        if(hz < lowerLimit) {
            return this._percentChange(lowerLimit, hz);
        }

        if(hz > upperLimit) {
            return this._percentChange(upperLimit, hz);
        }

        return 0;
    }

    /**
     * Returns the percent change from the original value to the current value.
     * @param original The original value.
     * @param current The current value.
     */
    private _percentChange(original: number, current: number): number {
        return ((current - original) / original) * 100;
    }

    /**
     * Gets a distribution of means from the baseline population for the given sample size
     */
    private _resample(population: number[], sampleSize: number): number[] {

        var distributionSize = 10000,
            distribution: number[] = new Array(distributionSize);

        for(var j = 0; j < distributionSize; j++) {
            var sum = 0;
            for (var i = 0; i < sampleSize; i++) {
                sum += population[Random.integer(0, population.length - 1)];
            }
            distribution[j] = sum / sampleSize;
        }

        return distribution.sort();
    }

    private _getTestResults(path: string[]): any {

        var results = this._results;
        for(var i = 0, l = path.length - 1; i < l; i++) {
            results = results.suites[path[i]];
            if(!results) {
                return;
            }
        }

        return results.tests[path[i]];
    }

    private _getPath(test: Test): string[] {

        var member: SuiteMember = test;
        var path: string[] = [];

        while(member) {
            if(member.parent) {
                path.push(member.title);
            }
            member = member.parent;
        }

        return path.reverse();
    }

    private static _getSuiteResults(suite: Suite): SuiteResults {

        var results: SuiteResults = {};

        if(suite.tests.length > 0) {
            results.tests = {};
            suite.tests.forEach(test => {
                if(!test.pending) {
                    var sampleHz = new Array(test.sample.length);
                    for(var i = 0; i < test.sample.length; i++) {
                        sampleHz[i] = Results.round(1/test.sample[i]);
                    }
                    results.tests[test.title] = sampleHz;
                }
            });
        }

        if(suite.suites.length > 0) {
            results.suites = {};
            suite.suites.forEach(suite => {
                if(!suite.pending && !suite.compare) {
                    results.suites[suite.title] = Results._getSuiteResults(suite);
                }
            });
        }

        return results;
    }

    private static round(hz: number): number {
        return hz < 1 ? parseFloat(hz.toFixed(2)) : Math.round(hz)
    }
}

interface SuiteResults {

    timestamp?: number;
    tests?: Lookup<number[]>;
    suites?: Lookup<SuiteResults>;
}

interface SuiteMember {

    title: string;
    parent: Suite;
}

export = Results;