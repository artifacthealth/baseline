import baseline = require("../src/baseline");
import NodeTimer = require("../src/nodeTimer");
import Evaluator = require("../src/evaluator");
import Test = require("../src/test");

var test1: Test;
var test2: Test;

var suite = baseline.suite("Some test suite", () => {

    var str = "hello world!";
    var reg = /world/;

    test1 = baseline.test("Regexp", () => {
        reg.test(str);
    });

    test2 = baseline.test("indexOf", () => {
        str.indexOf("world");
    });
});

var evaluator = new Evaluator(new NodeTimer());
evaluator.maxTime = 5;

suite.run(evaluator, (err: Error) => {
    if (err) throw err;
    console.log("Result = " + test1.compare(test2));
    process.exit();
});

