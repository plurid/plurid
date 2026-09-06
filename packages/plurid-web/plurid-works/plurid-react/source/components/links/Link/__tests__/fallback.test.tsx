/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';

    import {
        render,
        cleanup,
    } from '@testing-library/react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        installFrameClock,
    } from '../../../../testing';

    import PluridLink from '../index';
    // #endregion external
// #endregion imports



// #region module
describe('PluridLink outside and inside an application', () => {
    afterEach(cleanup);

    it('renders a plain anchor to the route outside an application (no engine store needed)', () => {
        const atClick = jest.fn();
        const { container } = render(
            <PluridLink
                route="/imagene/one"
                className="spatial-link"
                atClick={atClick}
            >
                Inspect
            </PluridLink>,
        );

        const anchor = container.querySelector('a') as HTMLAnchorElement;
        expect(anchor).toBeTruthy();
        expect(anchor.getAttribute('href')).toContain('/imagene/one');
        expect(anchor.className).toBe('spatial-link');
        expect(anchor.getAttribute('data-plurid-entity')).toBe('PluridLink');
        expect(anchor.getAttribute('data-plurid-link-route')).toBe('/imagene/one');
        expect(anchor.textContent).toBe('Inspect');

        anchor.click();
        expect(atClick).toHaveBeenCalledTimes(1);
    });

    it('renders through the engine inside an application', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes: [
                { route: '/one', component: () => <PluridLink route="/two">go</PluridLink> },
                { route: '/two', component: () => <div>two</div> },
            ],
            view: ['/one'],
        });

        const link = rendered.container.querySelector('[data-plurid-entity="PluridLink"]') as HTMLElement;
        expect(link).toBeTruthy();
        // the connected link is a real anchor: its href is the plane's address (U04, 2026-09-06) — the
        // engine still owns a plain click (preventDefault), a modifier-click keeps the browser's behaviour
        expect(link.getAttribute('href')).toMatch(/\/two$/);
        // the engine resolves the route against the application's host
        expect(link.getAttribute('data-plurid-link-route')).toMatch(/\/two$/);

        await rendered.unmount();
        clock.restore();
    });
});
// #endregion module
