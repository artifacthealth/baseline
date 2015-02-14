import baseline = require("../src/baseline");
import NodeTimer = require("../src/nodeTimer");
import Evaluator = require("../src/evaluator");

var suite = baseline.suite("Some test suite", () => {

    var value = true;
    baseline.test("!", () => {
          var test = !value;
    });
    baseline.test("!!!", () => {
          var test = !!!value;
    });
});

var evaluator = new Evaluator(new NodeTimer());
evaluator.maxTime = 5;

suite.run(evaluator, (err: Error) => {
    if (err) throw err;
});
