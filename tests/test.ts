import baseline = require("../src/baseline");
import NodeTimer = require("../src/nodeTimer");
import Evaluator = require("../src/evaluator");

var suite = baseline.suite("Some test suite", () => {

    var str = "hello world!";
    var reg = /world/;

    baseline.test("Regexp", () => {
        reg.test(str);
    });

    baseline.test("indexOf", () => {
        str.indexOf("world");
    });
});

var evaluator = new Evaluator(new NodeTimer());
evaluator.maxTime = 5;

suite.run(evaluator, (err: Error) => {
    if (err) throw err;
});
