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
 * SET ASIDE AND BACK (2026-10-20). A plane outside the docked page's lineage fades out through its
 * inline opacity, and fades back in when the space is revealed. The fade in is the plane rule's own
 * `transition`, which a background-color `transition` further down the same rule overrode: the plane
 * came back at once.
 */
describe('a plane set aside', () => {
    it('fades back in: the plane rule\'s transition carries the opacity and the background', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/one', component: Content }],
            view: ['/one'],
        });
        const plane = rendered.container.querySelector('[data-plurid-plane]')!;

        const shown = styledDeclarations(plane, 'transition').at(-1) ?? '';
        expect(shown).toContain('opacity var(--plurid-dock-fade, 240ms) ease');
        expect(shown).toContain('visibility 0s linear 0s');
        expect(shown).toContain('background-color 300ms linear');

        const aside = styledDeclarations(plane, 'transition', '[data-plurid-aside]').at(-1) ?? '';
        expect(aside).toContain('visibility 0s linear var(--plurid-dock-fade, 240ms)');
        expect(aside).toContain('background-color 300ms linear');
        await rendered.unmount();
    });
});
// #endregion module
