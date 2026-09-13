// #region imports
    // #region internal
    import {
        debounce,
        debouncedCallback,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `debounce` is what stands between a resize observer and a relayout, a pointer move and a URL
 * write. Two behaviours here are easy to assume and wrong: the TRAILING call carries the LAST
 * arguments, not the first; and `immediate` fires on the leading edge AND STILL SCHEDULES, so a
 * burst calls once at the start and — unlike the usual leading-edge debounce — not again at the end.
 */
describe('debounce', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('a burst is ONE call, after the wait, with the LAST arguments', () => {
        const calls: unknown[][] = [];
        const debounced = debounce((...args: unknown[]) => calls.push(args), 100);

        debounced('first');
        debounced('second');
        debounced('third');
        expect(calls).toEqual([]);

        jest.advanceTimersByTime(99);
        expect(calls).toEqual([]);

        jest.advanceTimersByTime(1);
        expect(calls).toEqual([['third']]);
    });

    it('the timer RESTARTS on every call: a steady stream never fires until it stops', () => {
        const calls: string[] = [];
        const debounced = debounce((value: string) => calls.push(value), 100);

        for (let tick = 0; tick < 10; tick += 1) {
            debounced('tick-' + tick);
            jest.advanceTimersByTime(90);
        }
        expect(calls).toEqual([]);

        jest.advanceTimersByTime(100);
        expect(calls).toEqual(['tick-9']);
    });

    it('IMMEDIATE fires on the leading edge, and the burst behind it adds nothing', () => {
        const calls: string[] = [];
        const debounced = debounce((value: string) => calls.push(value), 100, true);

        debounced('first');
        expect(calls).toEqual(['first']);

        debounced('second');
        debounced('third');
        jest.advanceTimersByTime(200);
        expect(calls).toEqual(['first']);

        // the window has passed: the next call leads again
        debounced('fourth');
        expect(calls).toEqual(['first', 'fourth']);
    });

    it('the call keeps its `this`, so a method can be debounced as a method', () => {
        const object = {
            name: 'the object',
            seen: [] as string[],
            record(this: { name: string; seen: string[] }, value: string) {
                this.seen.push(this.name + ':' + value);
            },
        };
        const debounced = debounce(object.record, 50);

        debounced.call(object, 'once');
        jest.advanceTimersByTime(50);
        expect(object.seen).toEqual(['the object:once']);
    });

    it('two debounced functions keep their own timers', () => {
        const a: string[] = [];
        const b: string[] = [];
        const first = debounce(() => a.push('a'), 100);
        const second = debounce(() => b.push('b'), 300);

        first();
        second();
        jest.advanceTimersByTime(100);
        expect({ a, b }).toEqual({ a: ['a'], b: [] });

        jest.advanceTimersByTime(200);
        expect({ a, b }).toEqual({ a: ['a'], b: ['b'] });
    });
});


describe('debouncedCallback', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('the typed one behaves the same: one trailing call with the latest arguments', () => {
        const calls: [string, number][] = [];
        const debounced = debouncedCallback<[string, number]>((...args) => calls.push(args), 100);

        debounced('a', 1);
        debounced('b', 2);
        jest.advanceTimersByTime(100);

        expect(calls).toEqual([['b', 2]]);
    });

    it('a second burst after the first has fired is its own call', () => {
        const calls: string[] = [];
        const debounced = debouncedCallback<[string]>((value) => calls.push(value), 100);

        debounced('first');
        jest.advanceTimersByTime(100);
        debounced('second');
        jest.advanceTimersByTime(100);

        expect(calls).toEqual(['first', 'second']);
    });
});
// #endregion module
