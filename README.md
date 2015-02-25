# Baseline

This is a work in progress. Check back in a couple weeks.


## Installation

Baseline can be installed using [npm](https://www.npmjs.com/):

```
$ npm install -g baseline
```

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

We then run baseline, passing it the name of the file containing the test suite we want to execute:

```
$ baseline test.js

Regexp vs indexOf
  Regexp: 15,297,117 ops/sec ±1.27%
  indexOf: 21,860,061 ops/sec ±0.68%


Completed 2 tests.
```

## Establishing a baseline

Baseline can save the results of a test to a file. Future runs of the same tests can then be compared against the saved
results to determine if performance has changed. To establish a baseline, run Baseline with a the `-b` option, providing
the name of the file to use.

```
$ baseline -b results.json test.js
```

## Comparing against a baseline

Once a baseline file has been created, if the program is run with the `-b` options again, the tests will be compared against
the established baseline. If the difference in the performance of the test compared to the baseline is greater than a
threshold of 10%, the test is reported as changed. The threshold can be adjusted using the `-T` option. Below is an example
of running Baseline with a threshold of 5%:

```
$ baseline -b results.json -T 5 test.js

Tests will be compared to baseline established on 2/24/2015 at 10:11:58 PM.

Regexp vs indexOf
  Regexp: 15,321,569 ops/sec ±0.73% (7% faster than baseline)
  indexOf: 21,564,642 ops/sec ±1.11%


Completed 2 tests, 1 faster.
```





