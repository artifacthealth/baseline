import baseline = require("../src/baseline");
import NodeTimer = require("../src/nodeTimer");
import Evaluator = require("../src/evaluator");

var suite = baseline.suite("Some test suite", () => {

    var str = "hello world!";
    var reg = /world/;

    baseline.test("Regexp", (done) => {
        reg.test(str);
        process.nextTick(done);
    });

    baseline.test("indexOf", (done) => {
        str.indexOf("world");
        process.nextTick(done);
    });
});

var evaluator = new Evaluator(new NodeTimer());
evaluator.maxTime = 5;

suite.run(evaluator, (err: Error) => {
    if (err) throw err;
    process.exit();
});
