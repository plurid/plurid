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
 * Whether scrolling `delta` px along `axis` from `target` would move some scrollable ancestor
 * INSIDE the plane — i.e. the wheel belongs to the content, not to the camera.
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

    while (element && element !== boundary) {
        const style = typeof getComputedStyle === 'function'
            ? getComputedStyle(element)
            : null;
        const overflow = style
            ? (axis === 'y' ? style.overflowY : style.overflowX)
            : 'visible';
        const scrolls = overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay';

        if (scrolls) {
            if (axis === 'y') {
                const room = element.scrollHeight - element.clientHeight;
                if (room > 1) {
                    if (delta > 0 && element.scrollTop < room - 1) {
                        return true;
                    }
                    if (delta < 0 && element.scrollTop > 1) {
                        return true;
                    }
                }
            } else {
                const room = element.scrollWidth - element.clientWidth;
                if (room > 1) {
                    if (delta > 0 && element.scrollLeft < room - 1) {
                        return true;
                    }
                    if (delta < 0 && element.scrollLeft > 1) {
                        return true;
                    }
                }
            }
        }

        element = element.parentElement;
    }

    return false;
};
// #endregion module
