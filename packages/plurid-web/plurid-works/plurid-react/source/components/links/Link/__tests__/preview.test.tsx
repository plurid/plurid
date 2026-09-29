/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';

    import {
        act,
        fireEvent,
    } from '@testing-library/react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
    } from '../../../../testing';

    import PluridLink from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * A HOVER NEVER TAKES THE APPLICATION DOWN (2026-09-29). The preview was portalled by
 * `#preview-<planeID>`: a plane id (`plurid://host/a@0`) is no CSS id, the first hover threw
 * `'#preview-plurid://…' is not a valid selector` in an effect, and React unmounted every plane.
 * It now hangs in the link's own plane, where its plane-local coordinates are measured.
 */
describe('a link\'s preview', () => {
    it('shows inside the link\'s plane on hover, and the space stays', async () => {
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const rendered = await renderPlurid({
                planes: [
                    {
                        route: '/a',
                        component: () => (
                            <PluridLink route="/b" preview previewFadeIn={1}>
                                open b
                            </PluridLink>
                        ),
                    },
                    { route: '/b', component: () => <div data-preview-of-b>the b plane</div> },
                ],
                view: ['/a'],
                configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
            } as any);

            const link = rendered.container.querySelector('[data-plurid-entity="PluridLink"]') as HTMLElement;
            expect(link).not.toBeNull();

            fireEvent.mouseEnter(link);
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 20));
            });

            const plane = link.closest('[data-plurid-plane]') as HTMLElement;
            const preview = rendered.container.querySelector('[data-preview-of-b]');
            expect(preview).not.toBeNull();
            // in the link's own plane, not in a detached container
            expect(plane.contains(preview)).toBe(true);
            // the space is still there, and nothing threw
            expect(rendered.container.querySelectorAll('[data-plurid-plane]')).toHaveLength(1);
            expect(errors.mock.calls.map((call) => String(call[0])).join('\n')).not.toMatch(/not a valid selector/);

            fireEvent.mouseLeave(link);
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 400));
            });
            expect(rendered.container.querySelector('[data-preview-of-b]')).toBeNull();
            await rendered.unmount();
        } finally {
            errors.mockRestore();
        }
    });
});
// #endregion module
