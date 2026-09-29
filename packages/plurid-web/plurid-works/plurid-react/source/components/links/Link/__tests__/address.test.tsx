/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';

    import {
        act,
        cleanup,
    } from '@testing-library/react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        installFrameClock,
        flushFrames,
    } from '../../../../testing';

    import PluridLink from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * A LINK IS ADDRESSED ON ITS APPLICATION'S HOST.
 *
 * The planes are registered under the application's `hostname`; the link computed its address with
 * no host at all, so each side took its own default — `plurid://origin/…` on the server,
 * `plurid://<location.host>/…` in the browser — and a server-rendered link never matched the
 * hydrated one (2026-09-29: the kit's generated application, served on a port, failed to hydrate on
 * its first link). jsdom's `location.host` is `localhost`: the application's host must win over it.
 */
const spaceOn = (
    hostname?: string,
) => renderPlurid({
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
    hostname,
    configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
} as any);

const link = (
    container: HTMLElement,
) => container.querySelector('[data-plurid-entity="PluridLink"]') as HTMLAnchorElement;


describe('PluridLink address', () => {
    afterEach(cleanup);

    it('is on the application\'s host, not on the document\'s', async () => {
        const rendered = await spaceOn('example.com');

        expect(link(rendered.container).getAttribute('data-plurid-link-route')).toBe('plurid://example.com/two');
        expect(link(rendered.container).getAttribute('href')).toBe('plurid://example.com/two');

        await rendered.unmount();
    });

    it('and opens the plane registered under that host', async () => {
        const clock = installFrameClock();
        const rendered = await spaceOn('example.com');

        act(() => {
            link(rendered.container).click();
        });
        await flushFrames(3);

        const child = rendered.api.getSnapshot().space.tree[0].children?.[0];
        expect(child?.route).toBe('plurid://example.com/two');
        expect(child?.show).not.toBe(false);

        await rendered.unmount();
        clock.restore();
    });

    it('an application without a host keeps the document\'s', async () => {
        const rendered = await spaceOn(undefined);

        expect(link(rendered.container).getAttribute('data-plurid-link-route')).toBe('plurid://localhost/two');

        await rendered.unmount();
    });
});
// #endregion module
