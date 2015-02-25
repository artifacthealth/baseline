/// <reference path="../lib/baseline.d.ts"/>

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

compare("process.nextTick vs setTimeout vs setImmediate", () => {

    test("process.nextTick", (done: Callback) => {
        process.nextTick(done);
    });

    test("setTimeout", (done: Callback) => {
        setTimeout(done, 0);
    });

    test("setImmediate", (done: Callback) => {
        setImmediate(done, 0);
    });
});

compare("Regexp vs indexOf", () => {

    var str = "hello world!";
    var reg = /world/;

    test("Regexp", () => {
        reg.test(str);
    });

    test("Inline Regexp", () => {
        /world/.test(str);
    });

    test("indexOf", () => {
        str.indexOf("world");
    });
});

