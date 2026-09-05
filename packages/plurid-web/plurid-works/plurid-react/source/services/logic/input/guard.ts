// #region module
const EDITABLE_SELECTOR = [
    'input',
    'textarea',
    'select',
    '[contenteditable]:not([contenteditable="false"])',
    '[role="textbox"]',
    '[role="combobox"]',
    '[role="searchbox"]',
].join(', ');


const asElement = (
    target: EventTarget | null | undefined,
): HTMLElement | null => {
    if (!target) {
        return null;
    }
    const node = target as Node;
    if (node.nodeType === 3) {
        return (node.parentElement as HTMLElement | null);
    }
    return (node as HTMLElement).closest ? (node as HTMLElement) : null;
};


/**
 * THE input guard: is this event target (or an ancestor) something the user types into? Covers
 * form fields, `<select>` type-ahead, every `contenteditable` flavor (rich-text editors, including
 * `plaintext-only`), and ARIA text boxes. The engine never consumes keys or drags that start here.
 */
export const isEditableTarget = (
    target: EventTarget | null | undefined,
): boolean => {
    const element = asElement(target);
    if (!element) {
        return false;
    }
    if (element.isContentEditable) {
        return true;
    }
    return !!element.closest(EDITABLE_SELECTOR);
};


/** An engine control (toolbar button, plane control, viewcube zone) — clicks belong to it. */
export const isEngineControl = (
    target: EventTarget | null | undefined,
): boolean => {
    const element = asElement(target);
    if (!element) {
        return false;
    }
    return !!element.closest('[data-plurid-control], button, a[href], [role="button"]');
};


/** The plane element containing the target, if any. */
export const planeElementOf = (
    target: EventTarget | null | undefined,
): HTMLElement | null => {
    const element = asElement(target);
    if (!element) {
        return null;
    }
    return element.closest('[data-plurid-plane]') as HTMLElement | null;
};


/**
 * Whether the wheel over `target` belongs to the CONTENT: some element from the target up to and
 * including `boundary` (the plane) is a user-scrollable box along `axis` — computed `overflow`
 * `auto` / `scroll` / `overlay` AND more content than box. The current scroll position is
 * deliberately NOT consulted: a list scrolled to its end keeps the wheel (the wheel then does
 * nothing, as it would on a page), because letting the leftover deltas fall through to the camera
 * turned every scroll-to-the-end — and every trackpad's momentum tail — into a zoom or a pan
 * (hypod, 2026-09-05). Nothing outside the plane counts: the page behind the space never scrolls.
 */
export const isScrollableAlong = (
    target: EventTarget | null | undefined,
    axis: 'x' | 'y',
    delta: number,
    boundary?: HTMLElement | null,
): boolean => {
    let element = asElement(target);
    if (!element || delta === 0) {
        return false;
    }
    while (element) {
        if (scrollsAlong(element, axis)) {
            return true;
        }
        if (element === boundary) {
            return false;
        }
        element = element.parentElement;
    }
    return false;
};

/** A user-scrollable box along `axis`: overflow that scrolls, and content beyond the box. */
const scrollsAlong = (
    element: HTMLElement,
    axis: 'x' | 'y',
): boolean => {
    const style = typeof getComputedStyle === 'function'
        ? getComputedStyle(element)
        : null;
    const overflow = style
        ? (axis === 'y' ? style.overflowY : style.overflowX)
        : 'visible';
    if (overflow !== 'auto' && overflow !== 'scroll' && overflow !== 'overlay') {
        return false;
    }
    const room = axis === 'y'
        ? element.scrollHeight - element.clientHeight
        : element.scrollWidth - element.clientWidth;
    return room > 1;
};
// #endregion module
