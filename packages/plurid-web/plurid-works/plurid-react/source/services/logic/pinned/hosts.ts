// #region module
/**
 * CONTENT THAT MOVES WITHOUT A REMOUNT (2026-10-31). A plane's content is rendered once, through a
 * React portal, into a HOST element of its own; the host is then moved, as a DOM node, between the
 * plane's world shell and its pinned frame. React never sees the move: the portal's container is
 * the same node all along, so the content's state, its effects, its inputs' values and its DOM
 * nodes are the same before and after a pin and a place.
 *
 * What a DOM move cannot keep, and this does not pretend to: an `<iframe>` (and Electron's
 * `<webview>`) loads again when it is moved, a custom element runs its disconnected and connected
 * callbacks, and a text selection is lost. Scroll offsets and the focus a browser drops when an
 * element leaves the document are put back here. A plane registered `pinnable: false` is never moved.
 */
export interface ContentHosts {
    /** The plane's content host (`null` when it unmounts). */
    host: (planeID: string, host: HTMLElement | null) => void;
    /** Where the content sits in the space: the world shell's slot. */
    world: (planeID: string, slot: HTMLElement | null) => void;
    /** Where the content sits pinned: the pinned frame's slot (`null` when the frame goes). */
    pinned: (planeID: string, slot: HTMLElement | null) => void;
    /** The host of a plane, for a test or a host's own check of continuity. */
    hostOf: (planeID: string) => HTMLElement | undefined;
}

/** The host's markers: no box of its own, so the plane's grid and the frame lay its content out. */
export const CONTENT_HOST_ATTRIBUTE = 'data-plurid-content-host';

export const createContentHost = (
    planeID: string,
): HTMLElement => {
    const element = document.createElement('div');
    element.setAttribute(CONTENT_HOST_ATTRIBUTE, planeID);
    element.style.display = 'contents';
    return element;
};

/** Move `host` into `target`, keeping what a browser drops with a node that leaves the document. */
const moveKeepingState = (
    host: HTMLElement,
    target: HTMLElement,
) => {
    const scrolled: [Element, number, number][] = [];
    if (host.scrollTop || host.scrollLeft) {
        scrolled.push([host, host.scrollTop, host.scrollLeft]);
    }
    for (const element of Array.from(host.querySelectorAll('*'))) {
        if (element.scrollTop || element.scrollLeft) {
            scrolled.push([element, element.scrollTop, element.scrollLeft]);
        }
    }
    const active = typeof document !== 'undefined' ? document.activeElement as HTMLElement | null : null;
    const focused = !!active && host.contains(active) ? active : null;

    target.appendChild(host);

    // THE OFFSETS GO BACK, and again once the commit that moved the host has laid its new place out:
    // a place moves the host while the plane's own size is still being written, and a scroller that
    // is not yet a scroller takes no offset. A later try touches only what nobody scrolled since.
    const seen = new Map<Element, [number, number]>();
    const restore = () => {
        for (const [element, top, left] of scrolled) {
            if (!element.isConnected) {
                continue;
            }
            const last = seen.get(element);
            if (last && (element.scrollTop !== last[0] || element.scrollLeft !== last[1])) {
                continue;
            }
            if (element.scrollTop !== top || element.scrollLeft !== left) {
                element.scrollTop = top;
                element.scrollLeft = left;
            }
            seen.set(element, [element.scrollTop, element.scrollLeft]);
        }
    };
    restore();
    if (scrolled.some(([element, top, left]) => element.scrollTop !== top || element.scrollLeft !== left)) {
        queueMicrotask(restore);
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(restore);
        }
    }
    if (focused && focused.isConnected && typeof focused.focus === 'function') {
        focused.focus({ preventScroll: true });
    }
};

export const createContentHosts = (): ContentHosts => {
    const hosts = new Map<string, HTMLElement>();
    const worlds = new Map<string, HTMLElement>();
    const pins = new Map<string, HTMLElement>();

    /** The host goes to its pinned frame while there is one, else to its world shell. */
    const settle = (
        planeID: string,
    ) => {
        const host = hosts.get(planeID);
        if (!host) {
            return;
        }
        const target = pins.get(planeID) ?? worlds.get(planeID);
        if (!target || host.parentNode === target) {
            return;
        }
        moveKeepingState(host, target);
    };

    const register = (
        map: Map<string, HTMLElement>,
        planeID: string,
        element: HTMLElement | null,
    ) => {
        if (element) {
            map.set(planeID, element);
        } else {
            map.delete(planeID);
        }
        settle(planeID);
    };

    return {
        host: (planeID, host) => register(hosts, planeID, host),
        world: (planeID, slot) => register(worlds, planeID, slot),
        pinned: (planeID, slot) => register(pins, planeID, slot),
        hostOf: (planeID) => hosts.get(planeID),
    };
};
// #endregion module
