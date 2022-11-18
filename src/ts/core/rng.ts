// ALEA RNG
function Mash(): any {
    var n: any = 0xefc8249d;
    return function (data: any): any {
        data = data.toString();
        for (var i: any = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            var h: any = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
}
function makeNewRng(seed: number | string): any {
    // Johannes Baagøe <baagoe@baagoe.com>, 2010
    var c: any = 1;
    var mash: any = Mash();
    let s0: any = mash(" ");
    let s1: any = mash(" ");
    let s2: any = mash(" ");
    s0 -= mash(seed);
    if (s0 < 0) {
        s0 += 1;
    }
    s1 -= mash(seed);
    if (s1 < 0) {
        s1 += 1;
    }
    s2 -= mash(seed);
    if (s2 < 0) {
        s2 += 1;
    }
    mash = null;
    var random: any = function (): any {
        var t: any = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
        s0 = s1;
        s1 = s2;
        return (s2 = t - (c = t | 0));
    };
    random.exportState = function (): any {
        return [s0, s1, s2, c];
    };
    random.importState = function (i: any): any {
        s0 = +i[0] || 0;
        s1 = +i[1] || 0;
        s2 = +i[2] || 0;
        c = +i[3] || 0;
    };
    return random;
}
export class RandomNumberGenerator {
    public internalRng = makeNewRng(seed || Math.random());

        constructor(seed) {
    }
    /**
     * Re-seeds the generator
     */
    reseed(seed: number | string): any {
        this.internalRng = makeNewRng(seed || Math.random());
    }
    /**
     * {} between 0 and 1
     */
    next(): number {
        return this.internalRng();
    }
    /**
     * Random choice of an array
     */
    choice(array: array): any {
        const index: any = this.nextIntRange(0, array.length);
        return array[index];
    }
    /**
     * {} Integer in range [min, max[
     */
    nextIntRange(min: number, max: number): number {
        assert(Number.isFinite(min), "Minimum is no integer");
        assert(Number.isFinite(max), "Maximum is no integer");
        assert(max > min, "rng: max <= min");
        return Math.floor(this.next() * (max - min) + min);
    }
    /**
     * {} Number in range [min, max[
     */
    nextRange(min: number, max: number): number {
        assert(max > min, "rng: max <= min");
        return this.next() * (max - min) + min;
    }
    /**
     * Updates the seed
     */
    setSeed(seed: number): any {
        this.internalRng = makeNewRng(seed);
    }
}
