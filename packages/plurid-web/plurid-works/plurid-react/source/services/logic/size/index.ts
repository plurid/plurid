// #region imports
    // #region external
    import { SetPlaneSizePayload } from '~services/state/modules/space/types';
    // #endregion external
// #endregion imports



// #region module
export interface PlaneSize {
    width: number;
    height: number;
}

/** A plane element's untransformed layout box, rounded to half a pixel; `null` while it has no size. */
export const measurePlaneElement = (
    element: HTMLElement,
): PlaneSize | null => {
    const width = Math.round(element.offsetWidth * 2) / 2;
    const height = Math.round(element.offsetHeight * 2) / 2;
    return width > 0 && height > 0 ? { width, height } : null;
};


export interface PlaneMeasurer {
    /** Watch a plane's element under its id; the returned function stops watching it. */
    observe: (element: HTMLElement, planeID: string) => () => void;
    /** Stop watching everything. */
    disconnect: () => void;
}

/** The part of `ResizeObserver` the measurer uses (a test hands in a fake). */
export type PlaneObserverConstructor = new (
    callback: (entries: { target: Element }[]) => void,
) => {
    observe: (target: Element) => void;
    unobserve: (target: Element) => void;
    disconnect: () => void;
};

const platformObserver = (): PlaneObserverConstructor | undefined => (
    typeof ResizeObserver === 'undefined' ? undefined : ResizeObserver as unknown as PlaneObserverConstructor
);

/**
 * THE SIZING CONTRACT's batching: ONE ResizeObserver for every plane of an application. The browser
 * delivers a frame's observations to one callback, so the N planes that re-measure after a relayout
 * are ONE report — one store write — with no timer and no delay. Every plane watched is measured
 * when its box changes (and once when watching starts); a plane whose box is empty is skipped.
 * `undefined` where the platform has no ResizeObserver (the server, jsdom): nothing measures.
 */
export const createPlaneMeasurer = (
    report: (sizes: SetPlaneSizePayload[]) => void,
    Observer: PlaneObserverConstructor | undefined = platformObserver(),
): PlaneMeasurer | undefined => {
    if (!Observer) {
        return undefined;
    }
    const planeOf = new Map<Element, string>();
    const observer = new Observer((entries) => {
        // the last observation of a plane in the frame wins
        const sizes = new Map<string, SetPlaneSizePayload>();
        for (const entry of entries) {
            const planeID = planeOf.get(entry.target);
            if (!planeID) {
                continue;
            }
            const size = measurePlaneElement(entry.target as HTMLElement);
            if (size) {
                sizes.set(planeID, { planeID, ...size });
            }
        }
        if (sizes.size > 0) {
            report([...sizes.values()]);
        }
    });
    return {
        observe: (element, planeID) => {
            planeOf.set(element, planeID);
            observer.observe(element);
            return () => {
                planeOf.delete(element);
                observer.unobserve(element);
            };
        },
        disconnect: () => {
            planeOf.clear();
            observer.disconnect();
        },
    };
};
// #endregion module
