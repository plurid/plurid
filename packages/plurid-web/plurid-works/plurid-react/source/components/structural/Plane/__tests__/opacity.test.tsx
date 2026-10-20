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
    import {
        styledDeclarations,
    } from '../../../../testing/styles';
    // #endregion external
// #endregion imports



// #region module
const Content = () => <div style={{ height: 120 }}>content</div>;

/**
 * A TRANSLUCENT PLANE (2026-10-20). `elements.plane.opacity` below 1 (the Space drawer's slider)
 * made the plane's background fully transparent: its colour is the `--plurid-plane` variable, which
 * the old colour decomposition could not read.
 */
describe('a plane\'s background opacity', () => {
    const background = async (opacity?: number) => {
        const rendered = await renderPlurid({
            planes: [{ route: '/one', component: Content }],
            view: ['/one'],
            configuration: (opacity === undefined ? {} : { elements: { plane: { opacity } } }) as any,
        });
        const values = styledDeclarations(rendered.container.querySelector('[data-plurid-plane]')!, 'background-color');
        await rendered.unmount();
        return values.at(-1);
    };

    it('mixes the plane colour with transparency, by the configured fraction', async () => {
        expect(await background(0.5)).toBe('color-mix(in srgb, var(--plurid-plane) 50%, transparent)');
        expect(await background(0)).toBe('color-mix(in srgb, var(--plurid-plane) 0%, transparent)');
    });

    it('is the plane colour when opaque', async () => {
        expect(await background()).toBe('var(--plurid-plane)');
    });
});
// #endregion module
