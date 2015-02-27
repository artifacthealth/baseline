[![Build Status](https://travis-ci.org/artifacthealth/baseline.svg?branch=master)](https://travis-ci.org/artifacthealth/baseline)

# Baseline

Baseline is a benchmarking framework for [node.js](http://nodejs.org/) where the results of a test run can be saved and
used to determine if performance changes in the future. Alternatively, tests can be compared against each other. Baseline
supports both synchronous and asynchronous tests using a simple syntax.

Baseline is inspired by and incorporates code from two projects: [Benchmark.js](http://benchmarkjs.com/) and
[mocha](http://mochajs.org/).


## Table of contents

* [`Installation`](#installation)
* [`Test suites`](#test-suites)
* [`Establishing a baseline`](#establishing-a-baseline)
* [`Updating a baseline`](#updating-a-baseline)
* [`Comparison tests`](#comparison-tests)
* [`Asynchronous tests`](#asynchronous-tests)
* [`Hooks`](#hooks)
* [`Pending tests`](#pending-tests)
* [`Reporters`](#reporters)
* [`A note on micro-benchmarks`](#micro-benchmarks)


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
suite("Sorting Algorithms", function() {

    test("Bubble Sort", function() {
        bubbleSort([49, 344, 431, 144, 122, 8, 207, 49, 8, 481, 10, 2]);
    });

    test("Insertion Sort", function() {
        insertionSort([49, 344, 431, 144, 122, 8, 207, 49, 8, 481, 10, 2]);
    });

    function insertionSort(array) {
        // implementation of insertion sort
    }

    function bubbleSort(array) {
        // implementation of bubble sort
    }
});
```

We then run Baseline, passing it the name of the file containing the test suite we want to execute:

```
$ baseline test.js

Sorting Algorithms
  Bubble Sort: 6,668,504 ops/sec ±0.66%
  Insertion Sort: 1,362,380 ops/sec ±0.74%

Completed 2 tests.
```

Each test is executed repeatedly until a statistically significant result can be established. The result is reported in
operations per second along with the relative margin of error. All statistical calculations are based on the
[Benchmark.js](http://benchmarkjs.com/) library.


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

Once a baseline file has been created, if the program is run with the `-b` option again, the tests will be compared against
the established baseline. If a change in the performance of a test compared to its baseline is at least 10%,
the test is reported as changed.

Suppose we changed the implementation of the insertion sort algorithm, improving its performance. Running Baseline
again will result in the following output.

```
$ baseline -b results.json test.js

Tests will be compared to baseline established on 2/26/2015 at 5:25:52 PM.

Sorting Algorithms
  Bubble Sort: 6,733,428 ops/sec ±0.44%
  Insertion Sort: 1,407,368 ops/sec ±0.70% (19% faster than baseline)

Completed 2 tests, 1 faster.
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
and report, with statistical significance, which tests are fastest, which are slowest, and by how much. Use the
`compare` function instead of `suite` to create a comparison test.

```
compare("Sorting Algorithms", function() {

    test("Bubble Sort", function() {
        bubbleSort([49, 344, 431, 144, 122, 8, 207, 49, 8, 481, 10, 2]);
    });

    test("Insertion Sort", function() {
        insertionSort([49, 344, 431, 144, 122, 8, 207, 49, 8, 481, 10, 2]);
    });

    function insertionSort(array) {
        // implementation of insertion sort
    }

    function bubbleSort(array) {
        // implementation of bubble sort
    }
});
```

Executing Baseline with this comparison test results in the following output:

```
$ baseline test.js

Sorting Algorithms
  Bubble Sort: 6,709,102 ops/sec ±0.51% (fastest)
  Insertion Sort: 1,432,421 ops/sec ±0.51% (79% slower)

Completed 2 tests.
```

Note that comparison tests are never compared to a baseline, even if the `-b` option is specified.


<a name="asynchronous-tests" />
## Asynchronous tests

Similar to [mocha](http://mochajs.org/), asynchronous tests are accomplished by including a callback, usually called
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


<a name="hooks" />
## Hooks
Baseline provides the hooks before(), after(), beforeEach(), afterEach(), that can be used to setup and cleanup tests.
During a test cycle, an individual test will be executed multiple times. Hooks must be written to take into account that
they will not be executed around each execution of a test, but rather around a series of executions.

```
suite('hooks', function() {
  before(function() {
    // runs before all tests in this block
  });
  after(function(){
    // runs after all tests in this block
  });
  beforeEach(function(){
    // runs before the first iteration of each test in this block
  });
  afterEach(function(){
    // runs after the last iteration of each test in this block
  });
  // test cases
});
```


<a name="pending-tests" />
## Pending tests
Tests that do not have a callback are considered pending and are used to document tests that will be implemented in the
future.

```
suite("pending", function() {

    test("will be implemented later");
});
```

To temporarily skip a test, adding `.skip` to a test will put the test in a pending state and skip execution.

```
suite("Sorting Algorithms", function() {

    // other cases

    test.skip("Insertion Sort", function() {
        // this test will not be executed
    });
});
```


<a name="reporters" />
## Reporters

### Default

The default reporter outputs results for each test.

![Default Reporter](https://raw.githubusercontent.com/artifacthealth/baseline/master/docs/img/default-reporter.png)


### Minimal

The minimal reporter only outputs results for tests that have changed from baseline. Otherwise, only the
summary is reported.

![Default Reporter](https://raw.githubusercontent.com/artifacthealth/baseline/master/docs/img/minimal-reporter.png)


<a name="micro-benchmarks" />
## A note on micro-benchmarks

Baseline cannot be used for micro-benchmarks such as determining if == or === is faster. The time required to call the
test function is generally greater than the time to execute the test itself. The [Benchmark.js](http://benchmarkjs.com/)
library is able run micro-benchmarks because it dynamically creates a function, when possible, that compiles the test case into
the test loop. Baseline does not do this. However, even this technique of dynamically creating the test function is not
possible for asynchronous tests or tests that reference variables from an outer scope. Regardless, V8 compiler
optimizations can make micro-benchmarks unreliable. Please see [this video](https://www.youtube.com/watch?v=65-RbBwZQdU)
for more information.