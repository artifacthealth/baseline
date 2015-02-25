# Baseline

This is a work in progress. Check back in a couple weeks.


## Installation

Baseline can be installed using [npm](https://www.npmjs.com/):

```
$ npm install -g baseline
```

## Test suites

Test suites follow a paradigm similar to the [mocha](http://mochajs.org/) unit test framework. Suppose you had a file
regexp-indexof.bench.js:

```
suite("Regexp vs indexOf", () => {

    var str = "hello world!";
    var reg = /world/;

    test("Regexp", () => {
        reg.test(str);
    });

    test("indexOf", () => {
        str.indexOf("world");
    });
});
```

We then run baseline, passing it the name of the file containing the test suite we want to execute:

```
$ baseline regexp-indexof.bench.js

Regexp vs indexOf
  Regexp: 15,297,117 ops/sec ±1.27%
  indexOf: 21,860,061 ops/sec ±0.68%
```




