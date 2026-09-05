/**
 * @jest-environment jsdom
 */

// #region imports
    // #region external
    import {
        isScrollableAlong,
        isEditableTarget,
        planeElementOf,
    } from '../guard';
    // #endregion external
// #endregion imports



// #region module
/** A box with the given overflow and content/box sizes (jsdom lays nothing out: the sizes are stubbed). */
const box = (
    overflowY: string,
    scrollHeight: number,
    clientHeight: number,
    overflowX = 'visible',
    scrollWidth = 0,
    clientWidth = 0,
): HTMLElement => {
    const element = document.createElement('div');
    element.style.overflowY = overflowY;
    element.style.overflowX = overflowX;
    Object.defineProperty(element, 'scrollHeight', { value: scrollHeight, configurable: true });
    Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true });
    Object.defineProperty(element, 'scrollWidth', { value: scrollWidth, configurable: true });
    Object.defineProperty(element, 'clientWidth', { value: clientWidth, configurable: true });
    return element;
};

const plane = (): HTMLElement => {
    const element = document.createElement('div');
    element.setAttribute('data-plurid-plane', 'plurid://test/plane@0');
    document.body.appendChild(element);
    return element;
};


describe('isScrollableAlong', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('a scroller between the target and the plane keeps the wheel, in both directions and at the end of its range', () => {
        const root = plane();
        const list = box('auto', 800, 120);
        const row = document.createElement('span');
        list.appendChild(row);
        root.appendChild(list);

        expect(isScrollableAlong(row, 'y', 100, root)).toBe(true);
        expect(isScrollableAlong(row, 'y', -100, root)).toBe(true);
        Object.defineProperty(list, 'scrollTop', { value: 680, configurable: true });
        expect(isScrollableAlong(row, 'y', 100, root)).toBe(true);
        // not along the other axis, and not for a zero delta
        expect(isScrollableAlong(row, 'x', 100, root)).toBe(false);
        expect(isScrollableAlong(row, 'y', 0, root)).toBe(false);
    });

    it('overflow that does not scroll, or content that fits, is not a scroller', () => {
        const root = plane();
        const hidden = box('hidden', 800, 120);
        const fits = box('auto', 120, 120);
        root.appendChild(hidden);
        root.appendChild(fits);

        expect(isScrollableAlong(hidden, 'y', 100, root)).toBe(false);
        expect(isScrollableAlong(fits, 'y', 100, root)).toBe(false);
    });

    it('the plane element itself counts; anything above the plane does not', () => {
        const page = box('auto', 4000, 700);
        document.body.appendChild(page);
        const root = plane();
        root.style.overflowY = 'auto';
        Object.defineProperty(root, 'scrollHeight', { value: 900, configurable: true });
        Object.defineProperty(root, 'clientHeight', { value: 400, configurable: true });
        page.appendChild(root);
        const content = document.createElement('div');
        root.appendChild(content);

        expect(isScrollableAlong(content, 'y', 40, root)).toBe(true);

        const flat = plane();
        page.appendChild(flat);
        const inner = document.createElement('div');
        flat.appendChild(inner);
        expect(isScrollableAlong(inner, 'y', 40, flat)).toBe(false);
    });

    it('a horizontal scroller answers the horizontal axis only', () => {
        const root = plane();
        const strip = box('visible', 100, 100, 'scroll', 2000, 300);
        root.appendChild(strip);

        expect(isScrollableAlong(strip, 'x', 30, root)).toBe(true);
        expect(isScrollableAlong(strip, 'y', 30, root)).toBe(false);
    });
});


describe('isEditableTarget / planeElementOf', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('finds the plane and the editable ancestors of a text node', () => {
        const root = plane();
        const input = document.createElement('textarea');
        root.appendChild(input);
        const text = document.createTextNode('x');
        const label = document.createElement('label');
        label.appendChild(text);
        root.appendChild(label);

        expect(isEditableTarget(input)).toBe(true);
        expect(isEditableTarget(text)).toBe(false);
        expect(planeElementOf(text)).toBe(root);
        expect(planeElementOf(document.body)).toBeNull();
    });
});
// #endregion module
