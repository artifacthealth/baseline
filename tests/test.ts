import Baseline = require("../src/baseline");
import Test = require("../src/test");
import Runner = require("../src/runner")

var baseline = new Baseline();

baseline.files = ["*.bench.js"]
baseline.baselinePath = "../../baseline.json";

baseline.run((err: Error, slower?: number) => {
    if(err) throw err;
    process.exit(slower || 0);
});