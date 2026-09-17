// #region module
type Listener = () => void;

let observer: ResizeObserver | undefined;
const listeners = new Map<Element, Set<Listener>>();

const ensure = (): ResizeObserver | undefined => {
    if (observer || typeof ResizeObserver === 'undefined') {
        return observer;
    }
    observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const set = listeners.get(entry.target);
            if (!set) {
                continue;
            }
            for (const listener of Array.from(set)) {
                listener();
            }
        }
    });
    return observer;
};


/**
 * ONE OBSERVER FOR EVERY LINK. Each link used to construct a `ResizeObserver` of its own, one per
 * link per mount, so a page of two hundred links had two hundred observers waking on the same
 * layout pass. One observer, a set of listeners per element, disconnected when the last leaves.
 */
export const observeResize = (
    element: Element,
    listener: Listener,
): (() => void) => {
    const live = ensure();
    if (!live) {
        return () => {};
    }

    let set = listeners.get(element);
    if (!set) {
        set = new Set();
        listeners.set(element, set);
        live.observe(element);
    }
    set.add(listener);

    return () => {
        const current = listeners.get(element);
        if (!current) {
            return;
        }
        current.delete(listener);
        if (current.size === 0) {
            listeners.delete(element);
            live.unobserve(element);
        }
        if (listeners.size === 0) {
            live.disconnect();
            observer = undefined;
        }
    };
};

/** how many elements are watched: for the tests */
export const observedElements = (): number => listeners.size;
// #endregion module
