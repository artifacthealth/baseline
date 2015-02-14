/// <reference path="../typings/node.d.ts" />
/// <reference path="../typings/async.d.ts" />

interface Callback {
    (err?: Error): void;
}

interface ResultCallback<T> extends Callback {
    (err?: Error, result?: T): void;
}

interface ActionCallback {
    (done?: Callback): void;
}
