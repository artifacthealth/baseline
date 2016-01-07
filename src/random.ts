/// <reference path="./types.d.ts" />

import crypto = require("crypto");

module Random {

    /**
     * Returns a random number between min and max inclusive.
     * @param min The minimum value.
     * @param max The maximum value.
     */
    export function integer(min: number, max: number): number {

        min = Math.floor(min);
        max = Math.floor(max);

        if(min >= max) {
            throw new Error("min must be less than max");
        }

        // Get a random UInt32
        var value = crypto.randomBytes(4).readUInt32LE(0);

        var range = (max - min);
        if(((range + 1) & range) === 0) {
            value = (value & range);
        }
        else {
            value = value % (range + 1);
        }

        return min + value;
    }
}

export = Random;