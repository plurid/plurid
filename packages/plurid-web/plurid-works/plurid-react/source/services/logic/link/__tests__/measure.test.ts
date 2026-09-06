/**
 * @jest-environment jsdom
 */

// #region imports
    // #region external
    import {
        measureLinkCoordinates,
        resolveLinkID,
    } from '../measure';
    // #endregion external
// #endregion imports



// #region module
/**
 * jsdom has no layout engine: `offset*` are always 0 and `offsetParent` null. Each element gets
 * its layout box defined explicitly, the way a browser would report it.
 */
const box = (
    element: HTMLElement,
    layout: { left: number; top: number; width: number; height: number; offsetParent?: HTMLElement | null },
) => {
    Object.defineProperty(element, 'offsetLeft', { value: layout.left, configurable: true });
    Object.defineProperty(element, 'offsetTop', { value: layout.top, configurable: true });
    Object.defineProperty(element, 'offsetWidth', { value: layout.width, configurable: true });
    Object.defineProperty(element, 'offsetHeight', { value: layout.height, configurable: true });
    Object.defineProperty(element, 'offsetParent', { value: layout.offsetParent ?? null, configurable: true });
};


/** A clipping box (a scroller): jsdom reports no client sizes, so they are set the way a browser would. */
const clip = (
    element: HTMLElement,
    size: { width: number; height: number },
) => {
    element.style.overflowY = 'auto';
    element.style.overflowX = 'auto';
    Object.defineProperty(element, 'clientWidth', { value: size.width, configurable: true });
    Object.defineProperty(element, 'clientHeight', { value: size.height, configurable: true });
};


const plane = (
    planeID = 'plane-1',
) => {
    const element = document.createElement('div');
    element.setAttribute('data-plurid-plane', planeID);
    document.body.appendChild(element);
    return element;
};


afterEach(() => {
    document.body.innerHTML = '';
});


describe('measureLinkCoordinates()', () => {
    it('link directly inside the plane: right edge and vertical middle', () => {
        const planeElement = plane();
        const link = document.createElement('a');
        planeElement.appendChild(link);
        box(link, { left: 20, top: 300, width: 120, height: 16, offsetParent: planeElement });

        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 140, y: 308 });
    });

    it('sums the offsets through a positioned ancestor', () => {
        const planeElement = plane();
        const section = document.createElement('section');
        const link = document.createElement('a');
        planeElement.appendChild(section);
        section.appendChild(link);
        box(section, { left: 16, top: 200, width: 300, height: 100, offsetParent: planeElement });
        box(link, { left: 4, top: 10, width: 100, height: 20, offsetParent: section });

        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 120, y: 220 });
    });

    it('subtracts the scroll of an intermediate scroller', () => {
        const planeElement = plane();
        const scroller = document.createElement('div');
        const link = document.createElement('a');
        planeElement.appendChild(scroller);
        scroller.appendChild(link);
        box(scroller, { left: 0, top: 50, width: 300, height: 200, offsetParent: planeElement });
        box(link, { left: 10, top: 400, width: 80, height: 20, offsetParent: scroller });
        scroller.scrollTop = 150;
        scroller.scrollLeft = 0;

        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 90, y: 310 });
    });

    it('clamps a link beyond the fold to the scroller\'s visible box: it anchors at the edge', () => {
        const planeElement = plane();
        const scroller = document.createElement('div');
        const link = document.createElement('a');
        planeElement.appendChild(scroller);
        scroller.appendChild(link);
        box(scroller, { left: 0, top: 56, width: 1000, height: 600, offsetParent: planeElement });
        clip(scroller, { width: 1000, height: 600 });
        box(link, { left: 800, top: 20, width: 80, height: 20, offsetParent: scroller });

        // visible: unchanged
        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 880, y: 86 });
        // scrolled above the fold: y clamps to the scroller's top edge
        scroller.scrollTop = 600;
        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 880, y: 56 });
        // scrolled so the link is below the fold: y clamps to the bottom edge
        scroller.scrollTop = -700;
        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 880, y: 656 });
        // a horizontal scroll clamps x too
        scroller.scrollTop = 0;
        scroller.scrollLeft = 2000;
        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 0, y: 86 });
    });

    it('clamps through two nested scrollers, each box in visual plane coordinates', () => {
        const planeElement = plane();
        const outer = document.createElement('div');
        const inner = document.createElement('div');
        const link = document.createElement('a');
        planeElement.appendChild(outer);
        outer.appendChild(inner);
        inner.appendChild(link);
        box(outer, { left: 0, top: 0, width: 600, height: 400, offsetParent: planeElement });
        clip(outer, { width: 600, height: 400 });
        box(inner, { left: 0, top: 300, width: 600, height: 200, offsetParent: outer });
        clip(inner, { width: 600, height: 200 });
        box(link, { left: 10, top: 150, width: 40, height: 20, offsetParent: inner });

        // the outer scroller brings the inner box up by 250: the inner box is at y 50..250, the link at 210
        outer.scrollTop = 250;
        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 50, y: 210 });
        // the inner scroller pushes the link above its own box: clamped to the inner top (50)
        inner.scrollTop = 190;
        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 50, y: 50 });
    });

    it('does not clamp into an ancestor that does not clip (overflow visible)', () => {
        const planeElement = plane();
        const wrapper = document.createElement('div');
        const link = document.createElement('a');
        planeElement.appendChild(wrapper);
        wrapper.appendChild(link);
        box(wrapper, { left: 0, top: 100, width: 200, height: 10, offsetParent: planeElement });
        Object.defineProperty(wrapper, 'clientWidth', { value: 200, configurable: true });
        Object.defineProperty(wrapper, 'clientHeight', { value: 10, configurable: true });
        box(link, { left: 0, top: 80, width: 40, height: 20, offsetParent: wrapper });

        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 40, y: 190 });
    });

    it('stops at an offset parent outside the plane', () => {
        const planeElement = plane();
        const link = document.createElement('a');
        planeElement.appendChild(link);
        box(link, { left: 30, top: 40, width: 50, height: 10, offsetParent: document.body });

        expect(measureLinkCoordinates(link, planeElement)).toEqual({ x: 80, y: 45 });
    });
});


describe('resolveLinkID()', () => {
    it('is the explicit id when given', () => {
        const planeElement = plane('p');
        const link = document.createElement('a');
        planeElement.appendChild(link);
        expect(resolveLinkID(link, planeElement, '/route', 'custom')).toBe('custom');
    });

    it('ordinal among the links to the same route inside the plane, in DOM order', () => {
        const planeElement = plane('p');
        const make = (route: string) => {
            const link = document.createElement('a');
            link.setAttribute('data-plurid-link-route', route);
            planeElement.appendChild(link);
            return link;
        };
        const a = make('/detail');
        const b = make('/other');
        const c = make('/detail');

        expect(resolveLinkID(a, planeElement, '/detail')).toBe('p#/detail#0');
        expect(resolveLinkID(b, planeElement, '/other')).toBe('p#/other#0');
        expect(resolveLinkID(c, planeElement, '/detail')).toBe('p#/detail#1');
    });

    it('escapes routes with quotes in the selector', () => {
        const planeElement = plane('p');
        const link = document.createElement('a');
        link.setAttribute('data-plurid-link-route', '/a"b');
        planeElement.appendChild(link);
        expect(resolveLinkID(link, planeElement, '/a"b')).toBe('p#/a"b#0');
    });
});
// #endregion module
