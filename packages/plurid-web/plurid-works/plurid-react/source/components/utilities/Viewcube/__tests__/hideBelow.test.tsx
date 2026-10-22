/**
 * @jest-environment jsdom
 */
/**
 * THE VIEWCUBE IS KEPT OFF A PHONE BY A MEDIA QUERY (2026-10-22). Applications kept it off small screens
 * with `show: typeof window !== 'undefined' ? window.innerWidth >= 800 : undefined`: the server
 * rendered the cube and the rail's fit button, a phone's first render did not, and the page did not
 * hydrate. `elements.viewcube.hideBelow` hides them with CSS, so the markup is the same at every width.
 */
import React from 'react';

import {
    renderPlurid,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;

const styles = () => [...document.querySelectorAll('style')]
    .map((style) => style.textContent ?? '')
    .join('\n');

/** The classes a `display: none !important` media rule hides (the document keeps every rule rendered so far). */
const hiddenClasses = () => [...styles().matchAll(
    /@media \(max-width: ?[\d.]+px\)\s*\{\s*\.([\w-]+)\s*\{\s*display:\s*none\s*!important;?\s*\}/g,
)].map((match) => match[1]);

const renderAt = async (
    width: number,
    hideBelow?: number,
) => {
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    const rendered = await renderPlurid({
        planes: [{ route: '/a', component: Page }],
        view: ['/a'],
        configuration: hideBelow === undefined
            ? {}
            : { elements: { viewcube: { hideBelow } } },
    } as any);
    const viewcube = rendered.container.querySelector('[data-plurid-control="viewcube"]');
    const fit = rendered.container.querySelector('[data-plurid-control="viewcube-fit"]');
    const result = {
        viewcube: viewcube?.getAttribute('class') ?? null,
        fit: fit?.getAttribute('class') ?? null,
    };
    await rendered.unmount();
    return result;
};


describe('elements.viewcube.hideBelow', () => {
    it('renders the same markup at every width, the cube and the fit button included', async () => {
        const wide = await renderAt(1440, 800);
        const narrow = await renderAt(390, 800);

        expect(wide.viewcube).not.toBeNull();
        expect(wide.fit).not.toBeNull();
        expect(narrow).toEqual(wide);
    });

    it('hides the cube and the fit button below the width with a media query', async () => {
        const { viewcube, fit } = await renderAt(1440, 800);
        const classes = hiddenClasses();

        expect(styles()).toMatch(/@media \(max-width: ?799\.98px\)/);
        expect(classes.some((name) => viewcube!.split(' ').includes(name))).toBe(true);
        expect(classes.some((name) => fit!.split(' ').includes(name))).toBe(true);
    });

    it('hides nothing without the setting', async () => {
        const { viewcube, fit } = await renderAt(390);
        const classes = hiddenClasses();

        expect(viewcube).not.toBeNull();
        expect(classes.some((name) => viewcube!.split(' ').includes(name))).toBe(false);
        expect(classes.some((name) => fit!.split(' ').includes(name))).toBe(false);
    });
});
