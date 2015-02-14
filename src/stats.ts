module Stats {

    /**
     * Calculates the arithmetic mean of the sample
     * @param sample The sample.
     */
    export function mean(sample: number[]) {

        var sum = 0;

        for(var i = 0, l = sample.length; i < l; i++) {
            sum += sample[i];
        }

        return (sum / l) || 0;
    }

    /**
     * Calculates the variables of the sample.
     * @param sample The sample.
     * @param mean The mean for the sample.
     */
    export function variance(sample: number[], mean: number): number {

        var sum = 0;

        for(var i = 0, l = sample.length; i < l; i++) {
            sum += Math.pow(sample[i] - mean, 2);
        }

        return (sum / (l - 1)) || 0;
    }

    /**
     * Gets the critical value for the specified degrees of freedom.
     * @param df The degrees of freedom.
     */
    export function criticalValue(df: number) {
        return tTable[Math.round(df) || 1] || tTableInfinity;
    }

    /**
     * T-Distribution two-tailed critical values for 95% confidence.
     * For more info see http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm.
     */
    var tTable:  { [df: number]: number } = {
        '1': 12.706, '2': 4.303, '3': 3.182, '4': 2.776, '5': 2.571, '6': 2.447,
        '7': 2.365, '8': 2.306, '9': 2.262, '10': 2.228, '11': 2.201, '12': 2.179,
        '13': 2.16, '14': 2.145, '15': 2.131, '16': 2.12, '17': 2.11, '18': 2.101,
        '19': 2.093, '20': 2.086, '21': 2.08, '22': 2.074, '23': 2.069, '24': 2.064,
        '25': 2.06, '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042
    }

    var tTableInfinity = 1.96;
}

export = Stats;