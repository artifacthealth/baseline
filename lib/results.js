/// <reference path="./types.d.ts" />
var fs = require("fs");
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
                if (ret._results.type === undefined) {
                    ret._results.type = "hz";
                }
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
    Results.prototype.getBaselineHz = function (test) {
        return this._findValue(this._getPath(test));
    };
    Results.prototype._findValue = function (path) {
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
        var results = {
            type: "sample"
        };
        if (suite.tests.length > 0) {
            results.tests = {};
            suite.tests.forEach(function (test) {
                if (!test.pending) {
                    results.tests[test.title] = 1 / (test.mean + test.moe);
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
    return Results;
})();
module.exports = Results;
//# sourceMappingURL=results.js.map