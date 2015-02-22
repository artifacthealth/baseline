/// <reference path="../lib/baseline.d.ts"/>

suite("Some test suite", () => {

    var str = "hello world!";
    var reg = /world/;

    test("Regexp", () => {
        reg.test(str);
    });

    test("indexOf", () => {
        str.indexOf("world");
    });
});