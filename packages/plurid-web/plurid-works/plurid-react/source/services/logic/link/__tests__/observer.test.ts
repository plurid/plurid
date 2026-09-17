/**
 * @jest-environment jsdom
 */

// #region imports
    // #region internal
    import {
        observeResize,
        observedElements,
    } from '../observer';
    // #endregion internal
// #endregion imports



// #region module
class FakeResizeObserver {
    static instances = 0;
    static live: FakeResizeObserver | undefined;
    observed = new Set<Element>();
    disconnected = false;
    constructor(
        public callback: (entries: { target: Element }[]) => void,
    ) {
        FakeResizeObserver.instances += 1;
        FakeResizeObserver.live = this;
    }
    observe(element: Element) { this.observed.add(element); }
    unobserve(element: Element) { this.observed.delete(element); }
    disconnect() { this.disconnected = true; this.observed.clear(); }
}

describe('one ResizeObserver for every link', () => {
    beforeAll(() => {
        (globalThis as any).ResizeObserver = FakeResizeObserver;
    });

    it('two elements, one observer; each hears its own resize; the last leaving disconnects it', () => {
        const a = document.createElement('a');
        const b = document.createElement('a');
        const heard: string[] = [];
        const offA = observeResize(a, () => heard.push('a'));
        const offA2 = observeResize(a, () => heard.push('a2'));
        const offB = observeResize(b, () => heard.push('b'));

        expect(FakeResizeObserver.instances).toBe(1);
        expect(observedElements()).toBe(2);
        const live = FakeResizeObserver.live!;
        expect(live.observed.has(a) && live.observed.has(b)).toBe(true);

        live.callback([{ target: a }]);
        expect(heard).toEqual(['a', 'a2']);

        offA();
        live.callback([{ target: a }]);
        expect(heard).toEqual(['a', 'a2', 'a2']);
        // a is still watched while one listener remains
        expect(live.observed.has(a)).toBe(true);
        offA2();
        expect(live.observed.has(a)).toBe(false);
        expect(observedElements()).toBe(1);

        offB();
        expect(observedElements()).toBe(0);
        expect(live.disconnected).toBe(true);

        // a listener after the last leaves gets a fresh observer, still one at a time
        observeResize(b, () => heard.push('b'));
        expect(FakeResizeObserver.instances).toBe(2);
    });
});
// #endregion module
