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

