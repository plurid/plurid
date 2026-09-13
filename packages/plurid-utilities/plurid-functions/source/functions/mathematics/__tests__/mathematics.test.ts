// #region imports
    // #region internal
    import {
        operation,
        sum,
        product,
        OPERATION_TYPES,
    } from '../arithmetic';
    import {
        checkIntegerNonUnit,
        normalizeBetween,
    } from '../numbers';
    import {
        toDegrees,
        toRadians,
    } from '../geometry';
    import {
        number,
    } from '../random';
    import {
        tau,
    } from '../constants';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `mathematics` is the family the web packages import MOST (nine files across the engine and the
 * react works: every layout, the camera, the viewcube), and it had no test until 2026-09-13. The
 * three things worth pinning are the ones a caller can get wrong from the signature alone: `sum`
 * and `product` take an INDEX, not a count of items to skip; they reduce with NO initial value, so a
 * one-element list is that element and a `DIFFERENCE` subtracts the rest from the first; and an
 * index past the end THROWS rather than clamping.
 */
describe('arithmetic', () => {
    it('sums and multiplies the whole list when no index is given', () => {
        expect(sum([1, 2, 3, 4])).toBe(10);
        expect(product([1, 2, 3, 4])).toBe(24);
        expect(sum([5])).toBe(5);
        expect(product([5])).toBe(5);
    });

    it('THE INDEX IS AN END, not a count to skip: it operates on everything BEFORE it', () => {
        expect(sum([1, 2, 3, 4], 2)).toBe(3);
        expect(product([1, 2, 3, 4], 3)).toBe(6);
        // the whole list, named explicitly
        expect(sum([1, 2, 3, 4], 4)).toBe(10);
    });

    it('an index of ZERO is nothing to operate on, and answers 0 — for a product too', () => {
        expect(sum([1, 2, 3], 0)).toBe(0);
        expect(product([1, 2, 3], 0)).toBe(0);
        expect(sum([], 0)).toBe(0);
        // an empty list with no index takes the same path (its length IS 0)
        expect(sum([])).toBe(0);
    });

    it('AN INDEX PAST THE END THROWS rather than clamping — the caller is wrong, not the data', () => {
        expect(() => sum([1, 2], 3)).toThrow();
        expect(() => product([1, 2], 99)).toThrow();
    });

    it('a DIFFERENCE reduces with no seed: the first value is the one the rest come off', () => {
        expect(operation(OPERATION_TYPES.DIFFERENCE, [10, 3, 2])).toBe(5);
        expect(operation(OPERATION_TYPES.DIFFERENCE, [10, 3, 2], 2)).toBe(7);
        // an unknown operation falls back to a sum
        expect(operation('NOT_AN_OPERATION' as never, [1, 2, 3])).toBe(6);
    });
});


describe('numbers', () => {
    it('`normalizeBetween` clamps to the limits and leaves anything inside alone', () => {
        expect(normalizeBetween(20, 0, 100)).toBe(20);
        expect(normalizeBetween(-20, 0, 100)).toBe(0);
        expect(normalizeBetween(120, 0, 100)).toBe(100);
        // the limits themselves are inside
        expect(normalizeBetween(0, 0, 100)).toBe(0);
        expect(normalizeBetween(100, 0, 100)).toBe(100);
        // and negative ranges are a range like any other
        expect(normalizeBetween(-5, -10, -1)).toBe(-5);
        expect(normalizeBetween(-50, -10, -1)).toBe(-10);
    });

    it('`checkIntegerNonUnit` is every integer except one', () => {
        expect(checkIntegerNonUnit(1)).toBe(false);
        expect(checkIntegerNonUnit(0)).toBe(true);
        expect(checkIntegerNonUnit(-1)).toBe(true);
        expect(checkIntegerNonUnit(42)).toBe(true);
        expect(checkIntegerNonUnit(1.5)).toBe(false);
        expect(checkIntegerNonUnit(NaN)).toBe(false);
    });
});


describe('geometry', () => {
    it('degrees and radians convert both ways, and round-trip exactly enough to compose', () => {
        expect(toDegrees(Math.PI)).toBeCloseTo(180, 12);
        expect(toRadians(180)).toBeCloseTo(Math.PI, 12);
        expect(toDegrees(0)).toBe(0);

        for (const angle of [-720, -90, 0, 33.75, 90, 359.9]) {
            expect(toDegrees(toRadians(angle))).toBeCloseTo(angle, 10);
        }
    });

    it('tau is the whole turn', () => {
        expect(tau).toBeCloseTo(2 * Math.PI, 12);
        expect(toDegrees(tau)).toBeCloseTo(360, 12);
    });
});


describe('a random number', () => {
    /** A thousand draws: enough that a bound that is off by one is not a coin flip. */
    const draws = (
        make: () => number,
    ) => Array.from({ length: 1000 }, make);

    it('the default is a rational in [0, 1)', () => {
        for (const value of draws(() => number())) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
        }
    });

    it('a rational between two bounds stays between them', () => {
        for (const value of draws(() => number(50, 10))) {
            expect(value).toBeGreaterThanOrEqual(10);
            expect(value).toBeLessThan(50);
        }
    });

    it('an INTEGER on the closed interval reaches BOTH endpoints, and never passes either', () => {
        const values = draws(() => number(6, 1, true));
        for (const value of values) {
            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(1);
            expect(value).toBeLessThanOrEqual(6);
        }
        // a die that never rolls a 1 or a 6 is not a die
        expect(values).toContain(1);
        expect(values).toContain(6);
    });

    it('the OPEN interval drops the upper endpoint (it keeps the lower one)', () => {
        const values = draws(() => number(6, 1, true, false));
        for (const value of values) {
            expect(value).toBeGreaterThanOrEqual(1);
            expect(value).toBeLessThan(6);
        }
        expect(values).toContain(1);
    });
});
// #endregion module
