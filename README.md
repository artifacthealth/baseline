# Baseline

This is a work in progress. Check back in a couple weeks.


## Table of contents

* [`Installation`](#installation)
* [`Test suites`](#test-suites)
* [`Establishing a baseline`](#establishing-a-baseline)
* [`Updating a baseline`](#updating-a-baseline)
* [`Comparison tests`](#comparison-tests)
* [`Asynchronous tests`](#asynchronous-tests)


<a name="installation" />
## Installation

Baseline can be installed using [npm](https://www.npmjs.com/):

```
$ npm install -g baseline
```

<a name="test-suites" />
## Test suites

Test suites follow a paradigm similar to the [mocha](http://mochajs.org/) unit test framework. Suppose you have a file
test.js:

```
suite("Regexp vs indexOf", function() {

    var str = "hello world!";
    var reg = /world/;

    test("Regexp", function() {
        reg.test(str);
    });

    test("indexOf", function() {
        str.indexOf("world");
    });
});
```

We then run Baseline, passing it the name of the file containing the test suite we want to execute:

```
$ baseline test.js

Regexp vs indexOf
  Regexp: 15,297,117 ops/sec ±1.27%
  indexOf: 21,860,061 ops/sec ±0.68%


Completed 2 tests.
```

Each test is executed repeatedly until a statistically significant result can be established, and is reported in
operations per second along with the relative margin of error. All statistical calculations are based on the
[Benchmark.js](http://benchmarkjs.com/) library, the brains behind [jsperf.com](https://jsperf.com/).


<a name="establishing-a-baseline" />
## Establishing a baseline

Baseline can save the results of test runs to a file. Future runs of the same tests can then be compared against the saved
results to determine if performance has changed. To establish a baseline, run Baseline with a the `-b` option, providing
the name of the file to use.

```
$ baseline -b results.json test.js
```

<a name="comparing-against-a-baseline" />
## Comparing against a baseline

Once a baseline file has been created, if the program is run with the `-b` options again, the tests will be compared against
the established baseline. If the change in the performance of a test compared to its baseline is at least 10%,
the test is reported as changed.

```
$ baseline -b results.json test.js

Tests will be compared to baseline established on 2/24/2015 at 10:11:58 PM.

Regexp vs indexOf
  Regexp: 13,614,434 ops/sec ±0.73% (11% slower than baseline)
  indexOf: 21,564,642 ops/sec ±1.11%


Completed 2 tests, 1 slower.
```

The default threshold of 10% can be adjusted using the `-T` option. Below is an example of running Baseline with a
threshold of 5%:

```
$ baseline -b results.json -T 5 test.js
```

<a name="updating-a-baseline" />
## Updating a baseline

Executing tests with the `-b` option will not change the baseline file once it has been created. Use the `-u` option to
update the baseline file with the result of the current test run.

```
$ baseline -b results.json -u test.js
```

<a name="comparison-tests" />
## Comparison tests

Similar to [jsperf.com](https://jsperf.com/), Baseline is able to compare the performance of several different tests
and report, with statistical significance, which tests are fastest, which are slowest, and by how much. Using the
`compare` function instead of `suite` creates a comparison test.

```
compare("Regexp vs indexOf", function() {

    var str = "hello world!";
    var reg = /world/;

    test("Regexp", function() {
        reg.test(str);
    });

    test("indexOf", function() {
        str.indexOf("world");
    });
});
```

Executing Baseline with this comparison test results in the following output:

```
$ baseline test.js

Regexp vs indexOf
  Regexp: 14,951,082 ops/sec ±1.67% (28% slower)
  indexOf: 20,680,257 ops/sec ±0.87% (fastest)


Completed 2 tests.
```

Note that comparison tests are never compared to a baseline, even if the `-b` option is specified.


<a name="asynchronous-tests" />
## Asynchronous tests

Similar to [mocha](http://mochajs.org/), asynchronous tests are accomplished by include a callback, usually called
`done`, as a parameter to the test function. The callback must be called once the test has completed.

```
compare("process.nextTick vs setTimeout vs setImmediate", function() {

    test("process.nextTick", function(done) {
        process.nextTick(done);
    });

    test("setTimeout", function(done) {
        setTimeout(done, 0);
    });

    test("setImmediate", function(done) {
        setImmediate(done);
    });
});
```

Baseline will automatically determine if the test should be execute as a synchronous or asynchronous test based on the
absence or presence of the callback in the test function. Also note that the callback accepts an `Error` object as a
parameter.


