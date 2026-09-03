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
