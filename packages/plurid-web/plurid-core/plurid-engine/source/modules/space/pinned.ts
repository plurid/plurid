// #region imports
    // #region libraries
    import {
        PLANE_BAR_HEIGHT,
    } from '@plurid/plurid-data';
    import type {
        PluridPinnedRect,
        PluridScreenRect,
        ViewSize,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * THE PINNED LAYER'S GEOMETRY (2026-10-31): pure, view px in and out, so a host can show where a
 * pin will land before it does.
 */

/** The margin a pinned frame keeps from the view's edges, and between frames along an edge. */
export const PINNED_MARGIN = 16;
/** A collapsed frame is its title bar. */
export const PINNED_COLLAPSED_HEIGHT = PLANE_BAR_HEIGHT;
/** The widest a collapsed bar is, along its edge. */
export const PINNED_COLLAPSED_WIDTH = 280;

const finite = (
    value: unknown,
    fallback: number,
): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

/** A pinned rect in view px: its unit and its anchor corner read against the view. */
export const resolvePinnedRect = (
    rect: PluridPinnedRect,
    view: ViewSize,
): PluridScreenRect => {
    const fraction = rect.unit === 'fraction';
    const width = Math.max(0, finite(rect.width, 0) * (fraction ? view.width : 1));
    const height = Math.max(0, finite(rect.height, 0) * (fraction ? view.height : 1));
    const x = finite(rect.x, 0) * (fraction ? view.width : 1);
    const y = finite(rect.y, 0) * (fraction ? view.height : 1);
    const anchor = rect.anchor ?? 'top-left';
    return {
        left: anchor.endsWith('right') ? view.width - x - width : x,
        top: anchor.startsWith('bottom') ? view.height - y - height : y,
        width,
        height,
    };
};

/** A rect in view px as a pinned rect: px, measured from the top-left. */
export const pinnedRectOf = (
    rect: PluridScreenRect,
): PluridPinnedRect => ({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
});

const overlaps = (
    a: PluridScreenRect,
    b: PluridScreenRect,
): boolean => a.left < b.left + b.width
    && b.left < a.left + a.width
    && a.top < b.top + b.height
    && b.top < a.top + a.height;

/**
 * A FREE SLOT ON THE RIGHT EDGE: a frame of `size` (default a third of the view's width, from 320 to
 * 560 px, and 70 % of its height) at the right margin, at the first height along the edge that
 * overlaps none of the `taken` frames; where that column is full, the same down the column to its
 * left, and so on across the view; where every column is full, cascaded down-left from the top so
 * each title still shows.
 */
export const freePinnedRect = (
    view: ViewSize,
    taken: PluridScreenRect[],
    size?: { width: number; height: number },
): PluridPinnedRect => {
    const width = Math.min(
        Math.max(0, view.width - 2 * PINNED_MARGIN),
        size?.width ?? Math.min(560, Math.max(320, Math.round(view.width / 3))),
    );
    const height = Math.min(
        Math.max(0, view.height - 2 * PINNED_MARGIN),
        size?.height ?? Math.round(view.height * 0.7),
    );
    const left = view.width - PINNED_MARGIN - width;
    for (let column = left; column >= PINNED_MARGIN - 0.5; column -= width + PINNED_MARGIN) {
        for (let top = PINNED_MARGIN; top + height <= view.height - PINNED_MARGIN + 0.5; top += PINNED_MARGIN) {
            const candidate = { left: column, top, width, height };
            if (!taken.some((other) => overlaps(candidate, other))) {
                return pinnedRectOf(candidate);
            }
        }
        if (width <= 0) {
            break;
        }
    }
    // every column is full: cascade, a title bar's height down and to the left of the last one
    const step = PINNED_COLLAPSED_HEIGHT * 0.75;
    const offset = (taken.length % 8) * step;
    return pinnedRectOf({
        left: Math.max(PINNED_MARGIN, left - offset),
        top: Math.min(view.height - PINNED_MARGIN - height, PINNED_MARGIN + offset),
        width,
        height,
    });
};

/**
 * THE COLLAPSED BARS, along the bottom edge from the right corner leftwards, then a row up when the
 * edge is full: a bar per collapsed plane in their stacking order, none over another. Returns each
 * plane's bar in view px.
 */
export const collapsedSlots = (
    planeIDs: string[],
    view: ViewSize,
): Record<string, PluridScreenRect> => {
    const width = Math.min(PINNED_COLLAPSED_WIDTH, Math.max(0, view.width - 2 * PINNED_MARGIN));
    const perRow = Math.max(1, Math.floor((view.width - PINNED_MARGIN) / (width + PINNED_MARGIN)));
    const slots: Record<string, PluridScreenRect> = {};
    planeIDs.forEach((planeID, index) => {
        const column = index % perRow;
        const row = Math.floor(index / perRow);
        slots[planeID] = {
            left: view.width - PINNED_MARGIN - width - column * (width + PINNED_MARGIN),
            top: view.height - PINNED_MARGIN - PINNED_COLLAPSED_HEIGHT - row * (PINNED_COLLAPSED_HEIGHT + PINNED_MARGIN),
            width,
            height: PINNED_COLLAPSED_HEIGHT,
        };
    });
    return slots;
};
// #endregion module
