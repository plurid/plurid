/**
 * @jest-environment jsdom
 */
/**
 * A ROOT ADDED TO THE VIEW IS NOT A MISSING PLANE (2026-10-16). The unregistered-route warning
 * compared the view with the render's tree, which trails the relayout by one commit: every root a
 * host added to `view` warned that it had no registered plane, although the plane was there. A
 * route that really matches no plane still warns.
 */
import React, { act } from 'react';

import {
    renderPlurid,
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';
import {
    resetWarnings,
} from '~services/logic/development/warn';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const Page: React.FC = () => <div>page</div>;
const planes = [{ route: '/folders/:id', component: Page }];
const unregistered = (warn: jest.SpyInstance) => warn.mock.calls
    .filter((call) => String(call[0]).includes('no registered plane'))
    .map((call) => String(call[0]));


describe('the view\'s routes', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
        installPointerEvents();
        installMatchMedia();
        resetWarnings();
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it('adds a root to the tree without warning', async () => {
        const rendered = await renderPlurid({ planes, view: ['/folders/a'] } as any);
        await act(async () => {
            await rendered.rerender({ planes, view: ['/folders/a', '/folders/b'] } as any);
        });

        const paths = rendered.handle.tree.get().map((plane) => new URL(plane.route).pathname);
        expect(paths).toEqual(['/folders/a', '/folders/b']);
        expect(unregistered(warn)).toEqual([]);
        await rendered.unmount();
    });

    it('still warns for a route no plane answers', async () => {
        const rendered = await renderPlurid({ planes, view: ['/folders/a', '/elsewhere'] } as any);
        await act(async () => {});

        expect(unregistered(warn)).toHaveLength(1);
        expect(unregistered(warn)[0]).toContain('/elsewhere');
        await rendered.unmount();
    });
});
