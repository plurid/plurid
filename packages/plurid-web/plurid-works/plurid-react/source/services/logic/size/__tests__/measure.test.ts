// #region imports
    // #region external
    import {
        measurePlaneElement,
        createPlaneMeasurer,
        PlaneObserverConstructor,
    } from '..';
    // #endregion external
// #endregion imports



// #region module
/** A fake ResizeObserver the test drives by hand: `fire(elements)` delivers one callback. */
const fakeObserver = () => {
    const observed = new Set<Element>();
    let deliver: ((entries: { target: Element }[]) => void) | undefined;
    class Observer {
        constructor(callback: (entries: { target: Element }[]) => void) {
            deliver = callback;
        }
        observe(target: Element) { observed.add(target); }
        unobserve(target: Element) { observed.delete(target); }
        disconnect() { observed.clear(); }
    }
    return {
        Observer: Observer as unknown as PlaneObserverConstructor,
        observed,
        fire: (elements: Element[]) => deliver!(elements.map((target) => ({ target }))),
    };
};

const element = (width: number, height: number): HTMLElement => ({ offsetWidth: width, offsetHeight: height } as unknown as HTMLElement);

describe('the plane measurer', () => {
    it('rounds a box to half a pixel and reads an empty one as nothing', () => {
        expect(measurePlaneElement(element(100.3, 50.74))).toEqual({ width: 100.5, height: 50.5 });
        expect(measurePlaneElement(element(0, 50))).toBeNull();
    });

    it('one observer, one report: the frame\'s observations of every watched plane land together', () => {
        const fake = fakeObserver();
        const reports: unknown[][] = [];
        const measurer = createPlaneMeasurer((sizes) => { reports.push(sizes); }, fake.Observer)!;
        const a = element(400, 300);
        const b = element(400, 200);
        const stop = measurer.observe(a, 'a');
        measurer.observe(b, 'b');
        expect(fake.observed.size).toBe(2);
        fake.fire([a, b, a]);
        expect(reports).toEqual([[{ planeID: 'a', width: 400, height: 300 }, { planeID: 'b', width: 400, height: 200 }]]);
        // an unwatched element and an empty box report nothing
        stop();
        fake.fire([a, element(0, 0)]);
        expect(reports).toHaveLength(1);
        fake.fire([b]);
        expect(reports).toHaveLength(2);
        measurer.disconnect();
        expect(fake.observed.size).toBe(0);
    });

    it('is nothing where the platform has no ResizeObserver', () => {
        expect(createPlaneMeasurer(() => {}, undefined)).toBeUndefined();
    });
});
// #endregion module
