/*!
 * The code in this module is a modified version of code originally from
 * Benchmark.js. Original Copyright follows.
 *
 * Benchmark.js v2.0.0-pre <http://benchmarkjs.com/>
 * Copyright 2010-2015 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
var Stats;
(function (Stats) {
    /**
     * Calculates the arithmetic mean of the sample
     * @param sample The sample.
     */
    function mean(sample) {
        var sum = 0;
        for (var i = 0, l = sample.length; i < l; i++) {
            sum += sample[i];
        }
        return (sum / l) || 0;
    }
    Stats.mean = mean;
    /**
     * Calculates the variables of the sample.
     * @param sample The sample.
     * @param mean The mean for the sample.
     */
    function variance(sample, mean) {
        var sum = 0;
        for (var i = 0, l = sample.length; i < l; i++) {
            sum += Math.pow(sample[i] - mean, 2);
        }
        return (sum / (l - 1)) || 0;
    }
    Stats.variance = variance;
    /**
     * Gets the critical value for the specified degrees of freedom.
     * @param df The degrees of freedom.
     */
    function criticalValue(df) {
        return tTable[Math.round(df) || 1] || tTableInfinity;
    }
    Stats.criticalValue = criticalValue;
    /**
     * Performs a Mann-Whitney U-Test
     * @param sample1 The first sample.
     * @param sample2 The second sample.
     * @returns Returns `-1` if sample1 is less than sample2, `1` sample1 is greater than sample2, and `0` if indeterminate.
     */
    function mannWhitneyUTest(sample1, sample2) {
        // Exit early if comparing the same samples
        if (sample1 === sample2) {
            return 0;
        }
        var size1 = sample1.length, size2 = sample2.length, maxSize = Math.max(size1, size2), minSize = Math.min(size1, size2), u1 = getU(sample1, sample2), u2 = getU(sample2, sample1), u = Math.min(u1, u2);
        function getScore(xA, sampleB) {
            return sampleB.reduce(function (total, xB) {
                return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
            }, 0);
        }
        function getU(sampleA, sampleB) {
            return sampleA.reduce(function (total, xA) {
                return total + getScore(xA, sampleB);
            }, 0);
        }
        function getZ(u) {
            return (u - ((size1 * size2) / 2)) / Math.sqrt((size1 * size2 * (size1 + size2 + 1)) / 12);
        }
        // Reject the null hypothesis the two samples come from the
        // same population (i.e. have the same median) if...
        if (size1 + size2 > 30) {
            // ...the z-stat is greater than 1.96 or less than -1.96
            // http://www.statisticslectures.com/topics/mannwhitneyu/
            var zStat = getZ(u);
            return Math.abs(zStat) > 1.96 ? (u == u1 ? 1 : -1) : 0;
        }
        // ...the U value is less than or equal the critical U value.
        var critical = maxSize < 5 || minSize < 3 ? 0 : uTable[maxSize][minSize - 3];
        return u <= critical ? (u == u1 ? 1 : -1) : 0;
    }
    Stats.mannWhitneyUTest = mannWhitneyUTest;
    /**
     * T-Distribution two-tailed critical values for 95% confidence.
     * For more info see http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm.
     */
    var tTable = {
        '1': 12.706,
        '2': 4.303,
        '3': 3.182,
        '4': 2.776,
        '5': 2.571,
        '6': 2.447,
        '7': 2.365,
        '8': 2.306,
        '9': 2.262,
        '10': 2.228,
        '11': 2.201,
        '12': 2.179,
        '13': 2.16,
        '14': 2.145,
        '15': 2.131,
        '16': 2.12,
        '17': 2.11,
        '18': 2.101,
        '19': 2.093,
        '20': 2.086,
        '21': 2.08,
        '22': 2.074,
        '23': 2.069,
        '24': 2.064,
        '25': 2.06,
        '26': 2.056,
        '27': 2.052,
        '28': 2.048,
        '29': 2.045,
        '30': 2.042
    };
    var tTableInfinity = 1.96;
    /**
     * Critical Mann-Whitney U-values for 95% confidence.
     * For more info see http://www.saburchill.com/IBbiology/stats/003.html.
     */
    var uTable = {
        '5': [0, 1, 2],
        '6': [1, 2, 3, 5],
        '7': [1, 3, 5, 6, 8],
        '8': [2, 4, 6, 8, 10, 13],
        '9': [2, 4, 7, 10, 12, 15, 17],
        '10': [3, 5, 8, 11, 14, 17, 20, 23],
        '11': [3, 6, 9, 13, 16, 19, 23, 26, 30],
        '12': [4, 7, 11, 14, 18, 22, 26, 29, 33, 37],
        '13': [4, 8, 12, 16, 20, 24, 28, 33, 37, 41, 45],
        '14': [5, 9, 13, 17, 22, 26, 31, 36, 40, 45, 50, 55],
        '15': [5, 10, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64],
        '16': [6, 11, 15, 21, 26, 31, 37, 42, 47, 53, 59, 64, 70, 75],
        '17': [6, 11, 17, 22, 28, 34, 39, 45, 51, 57, 63, 67, 75, 81, 87],
        '18': [7, 12, 18, 24, 30, 36, 42, 48, 55, 61, 67, 74, 80, 86, 93, 99],
        '19': [7, 13, 19, 25, 32, 38, 45, 52, 58, 65, 72, 78, 85, 92, 99, 106, 113],
        '20': [8, 14, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 98, 105, 112, 119, 127],
        '21': [8, 15, 22, 29, 36, 43, 50, 58, 65, 73, 80, 88, 96, 103, 111, 119, 126, 134, 142],
        '22': [9, 16, 23, 30, 38, 45, 53, 61, 69, 77, 85, 93, 101, 109, 117, 125, 133, 141, 150, 158],
        '23': [9, 17, 24, 32, 40, 48, 56, 64, 73, 81, 89, 98, 106, 115, 123, 132, 140, 149, 157, 166, 175],
        '24': [10, 17, 25, 33, 42, 50, 59, 67, 76, 85, 94, 102, 111, 120, 129, 138, 147, 156, 165, 174, 183, 192],
        '25': [10, 18, 27, 35, 44, 53, 62, 71, 80, 89, 98, 107, 117, 126, 135, 145, 154, 163, 173, 182, 192, 201, 211],
        '26': [11, 19, 28, 37, 46, 55, 64, 74, 83, 93, 102, 112, 122, 132, 141, 151, 161, 171, 181, 191, 200, 210, 220, 230],
        '27': [11, 20, 29, 38, 48, 57, 67, 77, 87, 97, 107, 118, 125, 138, 147, 158, 168, 178, 188, 199, 209, 219, 230, 240, 250],
        '28': [12, 21, 30, 40, 50, 60, 70, 80, 90, 101, 111, 122, 132, 143, 154, 164, 175, 186, 196, 207, 218, 228, 239, 250, 261, 272],
        '29': [13, 22, 32, 42, 52, 62, 73, 83, 94, 105, 116, 127, 138, 149, 160, 171, 182, 193, 204, 215, 226, 238, 249, 260, 271, 282, 294],
        '30': [13, 23, 33, 43, 54, 65, 76, 87, 98, 109, 120, 131, 143, 154, 166, 177, 189, 200, 212, 223, 235, 247, 258, 270, 282, 293, 305, 317]
    };
})(Stats || (Stats = {}));
module.exports = Stats;
//# sourceMappingURL=stats.js.map