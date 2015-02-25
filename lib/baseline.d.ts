interface Callback {
    (err?: Error): void;
}

interface ActionCallback {
    (done?: Callback): void;
}

declare var suite: {
    (title: string, block: () => void): void;
    skip(title: string, block: () => void): void;
}

declare var compare: {
    (title: string, block: () => void): void;
    skip(title: string, block: () => void): void;
}

declare var test: {
    (title: string, action?: ActionCallback): void;
    skip(title: string, action: ActionCallback): void;
}

declare function after(action: ActionCallback): void;
declare function before(action: ActionCallback): void;
declare function afterEach(action: ActionCallback): void;
declare function beforeEach(action: ActionCallback): void;
