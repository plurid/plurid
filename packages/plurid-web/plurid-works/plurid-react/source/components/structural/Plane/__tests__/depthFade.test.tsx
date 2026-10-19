/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries

    // #region external
    import {
        renderPlurid,
    } from '../../../../testing';
    // #endregion external
// #endregion imports



// #region module
const Content = () => <div style={{ height: 120 }}>content</div>;

/**
 * The values of `property` in an element's own styled rule, in source order: the LAST is the one a
 * browser applies (jsdom cannot resolve a `var()`, so the computed style says nothing here).
 */
const declarations = (
    element: Element,
    property: string,
): string[] => {
    const css = Array.from(document.querySelectorAll('style')).map((style) => style.textContent || '').join('');
    const values: string[] = [];
    for (const name of Array.from(element.classList)) {
        for (const rule of css.matchAll(new RegExp('(?:^|})\\.' + name + '\\{([^}]*)\\}', 'g'))) {
            for (const declaration of rule[1].split(';')) {
                const separator = declaration.indexOf(':');
                if (declaration.slice(0, separator).trim() === property) {
                    values.push(declaration.slice(separator + 1).trim());
                }
            }
        }
    }
    return values;
};

/**
 * THE DEPTH CUE IS THE PLANE'S OPACITY (2026-10-19). `elements.plane.depthFade` wrote its fade in a
 * declaration that the plane rule's own `opacity` overrode further down, so a shown plane stayed
 * opaque at any distance and only the blur reached the screen; the culling pass's variables were set
 * (`e2e/rendering.spec.ts` checks them) and nothing read the fade.
 */
describe('a plane with the depth cue', () => {
    const opacity = async (configuration: object) => {
        const rendered = await renderPlurid({
            planes: [{ route: '/one', component: Content }],
            view: ['/one'],
            configuration: configuration as any,
        });
        const values = declarations(rendered.container.querySelector('[data-plurid-plane]')!, 'opacity');
        rendered.unmount();
        return values.at(-1);
    };

    it('fades with the culling pass\'s variable', async () => {
        expect(await opacity({ elements: { plane: { depthFade: { enabled: true } } } }))
            .toBe('var(--plurid-plane-fade, 1)');
    });

    it('is opaque without it', async () => {
        expect(await opacity({})).toBe('1');
    });
});
// #endregion module
