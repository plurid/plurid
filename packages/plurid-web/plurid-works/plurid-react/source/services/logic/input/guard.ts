// #region imports
    // #region libraries
    import {
        PLURID_ATTRIBUTE_ENTITY,
        PLURID_ATTRIBUTE_DRAG_HANDLE,
        PLURID_ATTRIBUTE_PLANE_ANCHOR,
        PLURID_ENTITY_PLANE_CONTROLS,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



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


/** The field an event target types into (its editable root), or nothing. */
export const editableRootOf = (
    target: EventTarget | null | undefined,
): HTMLElement | null => {
    const element = asElement(target);
    if (!element || !isEditableTarget(element)) {
        return null;
    }
    return element.isContentEditable
        ? (element.closest('[contenteditable]') as HTMLElement | null) || (element as HTMLElement)
        : (element.closest(EDITABLE_SELECTOR) as HTMLElement | null) || (element as HTMLElement);
};


/**
 * A typing target that HAS THE KEYBOARD: the field, or something inside it, is the active element.
 * A field the pointer merely hovers is not typing anything, so a press or a wheel over it is the
 * space's in a navigation mode; a field with the caret in it keeps its own selection and scroll.
 */
export const isFocusedEditable = (
    target: EventTarget | null | undefined,
): boolean => {
    const root = editableRootOf(target);
    if (!root || typeof document === 'undefined') {
        return false;
    }
    const active = document.activeElement;
    return !!active && (active === root || root.contains(active));
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


/** The engine overlay (a dialog, the palette, a menu, the minimap, the rail, a HUD) a target sits in. */
export const overlayOf = (
    target: EventTarget | null | undefined,
): Element | null => {
    const element = asElement(target);
    return element ? element.closest('[data-plurid-overlay]') : null;
};


/**
 * A KEY THE CHROME OWNS, not the space. Inside an overlay every key is the overlay's: the shortcuts
 * dialog scrolls with the arrows, the palette and the menus keep their keys, and nothing behind a
 * modal moves. On a control (a button, a link, anything `role="button"` or `data-plurid-control`)
 * Enter and Space activate it. The view listens on its own element and runs BEFORE React's handlers,
 * so a control's `stopPropagation` came too late: Enter on the toolbar framed a plane and Space
 * armed the grab instead of pressing the button. A plane's focus anchor is the space's own tab stop,
 * not chrome: its Enter frames and its Space selects.
 */
export const chromeOwnsKey = (
    event: KeyboardEvent,
): boolean => {
    const element = asElement(event.target);
    if (!element) {
        return false;
    }
    if (overlayOf(element)) {
        return true;
    }
    if (typeof element.hasAttribute === 'function' && element.hasAttribute(PLURID_ATTRIBUTE_PLANE_ANCHOR)) {
        return false;
    }
    const activates = event.key === 'Enter'
        || event.key === ' '
        || event.code === 'Enter'
        || event.code === 'NumpadEnter'
        || event.code === 'Space';
    return activates && isEngineControl(element);
};


/** The handle a selected plane is dragged by: its controls bar, or what a host marks `data-plurid-drag-handle`. */
export const DRAG_HANDLE_SELECTOR = `[${PLURID_ATTRIBUTE_DRAG_HANDLE}], [${PLURID_ATTRIBUTE_ENTITY}="${PLURID_ENTITY_PLANE_CONTROLS}"]`;

/** The press landed on a plane's handle (see `gestures.dragHandle`). */
export const isDragHandle = (
    target: EventTarget | null | undefined,
): boolean => {
    const element = asElement(target);
    if (!element) {
        return false;
    }
    return !!element.closest(DRAG_HANDLE_SELECTOR);
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
