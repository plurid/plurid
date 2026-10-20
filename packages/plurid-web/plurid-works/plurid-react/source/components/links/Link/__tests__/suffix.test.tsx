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

    import PluridLink from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE LINK'S OWN SUFFIX (2026-10-20). The `'` after a link's text is the link's `::after`. Written
 * bare in the rule, `::after` is a descendant selector: a text link has no element under it, so it
 * drew no suffix, and a link holding elements put one after each of them.
 */
describe('a link\'s suffix', () => {
    it('is drawn after the link itself, not after what it holds', async () => {
        const rendered = await renderPlurid({
            planes: [
                {
                    route: '/one',
                    component: () => (
                        <PluridLink route="/two">
                            two
                        </PluridLink>
                    ),
                },
                { route: '/two', component: () => <div>two</div> },
            ],
            view: ['/one'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        } as any);
        const link = rendered.container.querySelector('[data-plurid-entity="PluridLink"]')!;

        expect(styledDeclarations(link, 'content', '::after').at(-1)).toBe('"\'"');
        const css = Array.from(document.querySelectorAll('style')).map((style) => style.textContent || '').join('');
        for (const name of Array.from(link.classList)) {
            expect(css).not.toContain('.' + name + ' ::after');
        }
        await rendered.unmount();
    });
});
// #endregion module
