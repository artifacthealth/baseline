import Baseline = require("../src/baseline");
import Test = require("../src/test");
import Runner = require("../src/runner")

var baseline = new Baseline();

baseline.files = ["*.benchmark.js"]

baseline.run((err: Error) => {
    if(err) throw err;

    process.exit(0);
})