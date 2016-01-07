/// <reference path="./types.d.ts" />
var fs = require("fs");
var Random = require("./random");
var Results = (function () {
    function Results() {
    }
    Object.defineProperty(Results.prototype, "timestamp", {
        get: function () {
            return this._results ? new Date(this._results.timestamp) : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Results.fromSuite = function (suite) {
        var ret = new Results();
        ret._results = Results._getSuiteResults(suite);
        ret._results.timestamp = new Date().getTime();
        return ret;
    };
    Results.load = function (filename, callback) {
        Results._fileExists(filename, function (exists) {
            if (!exists)
                return callback();
            fs.readFile(filename, "utf8", function (err, data) {
                if (err)
                    return callback(err);
                var ret = new Results();
                ret._results = JSON.parse(data);
                callback(null, ret);
            });
        });
    };
    Results._fileExists = function (filename, callback) {
        if (!filename)
            return callback(false);
        fs.exists(filename, callback);
    };
    Results.prototype.save = function (filename, callback) {
        fs.writeFile(filename, JSON.stringify(this._results, null, "  "), "utf8", callback);
    };
    Results.prototype.compare = function (test, confidence) {
        var baselineSample = this._getTestResults(this._getPath(test));
        if (!baselineSample)
            return;
        if (typeof baselineSample == "number") {
            // old data format where we just stored the adjusted hz
            return this._percentChange(baselineSample, test.adjustedHz);
        }
        if (!Array.isArray(baselineSample))
            return;
        var distribution = this._resample(baselineSample, test.sample.length);
        var offset = distribution.length * ((100 - confidence) / 100.0);
        var lowerLimit = distribution[Math.ceil(offset)];
        var upperLimit = distribution[Math.floor(distribution.length - (offset + 1))];
        var hz = Results.round(test.hz);
        if (hz < lowerLimit) {
            return this._percentChange(lowerLimit, hz);
        }
        if (hz > upperLimit) {
            return this._percentChange(upperLimit, hz);
        }
        return 0;
    };
    /**
     * Returns the percent change from the original value to the current value.
     * @param original The original value.
     * @param current The current value.
     */
    Results.prototype._percentChange = function (original, current) {
        return ((current - original) / original) * 100;
    };
    /**
     * Gets a distribution of means from the baseline population for the given sample size
     */
    Results.prototype._resample = function (population, sampleSize) {
        var distributionSize = 10000, distribution = new Array(distributionSize);
        for (var j = 0; j < distributionSize; j++) {
            var sum = 0;
            for (var i = 0; i < sampleSize; i++) {
                sum += population[Random.integer(0, population.length - 1)];
            }
            distribution[j] = sum / sampleSize;
        }
        return distribution.sort();
    };
    Results.prototype._getTestResults = function (path) {
        var results = this._results;
        for (var i = 0, l = path.length - 1; i < l; i++) {
            results = results.suites[path[i]];
            if (!results) {
                return;
            }
        }
        return results.tests[path[i]];
    };
    Results.prototype._getPath = function (test) {
        var member = test;
        var path = [];
        while (member) {
            if (member.parent) {
                path.push(member.title);
            }
            member = member.parent;
        }
        return path.reverse();
    };
    Results._getSuiteResults = function (suite) {
        var results = {};
        if (suite.tests.length > 0) {
            results.tests = {};
            suite.tests.forEach(function (test) {
                if (!test.pending) {
                    var sampleHz = new Array(test.sample.length);
                    for (var i = 0; i < test.sample.length; i++) {
                        sampleHz[i] = Results.round(1 / test.sample[i]);
                    }
                    results.tests[test.title] = sampleHz;
                }
            });
        }
        if (suite.suites.length > 0) {
            results.suites = {};
            suite.suites.forEach(function (suite) {
                if (!suite.pending && !suite.compare) {
                    results.suites[suite.title] = Results._getSuiteResults(suite);
                }
            });
        }
        return results;
    };
    Results.round = function (hz) {
        return hz < 1 ? parseFloat(hz.toFixed(2)) : Math.round(hz);
    };
    return Results;
})();
module.exports = Results;
//# sourceMappingURL=results.js.map