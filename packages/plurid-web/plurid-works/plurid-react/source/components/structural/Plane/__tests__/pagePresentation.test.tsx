/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';
    // #endregion libraries

    // #region external
    import {
        renderPlurid,
    } from '../../../../testing';
    import PluridLink from '../../../links/Link';
    // #endregion external
// #endregion imports



// #region module
const Page = () => <div style={{ height: 3000 }}>a long page</div>;

describe('the page presentation', () => {
    it('renders every plane view-sized with a scrolling content row, the bar as an overlay, and the view docked', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/page', component: Page }],
            view: ['/page'],
            configuration: { space: { presentation: 'page', navigation: { motion: { duration: 0 } } } } as any,
        });
        const state = rendered.api.getSnapshot();
        expect(state.configuration.space.presentation).toBe('page');
        expect(state.configuration.space.fadeInTime).toBe(0);
        expect(state.configuration.space.opaque).toBe(false);
        expect(state.configuration.elements.plane.height).toBe(1);

        const { width, height } = state.space.viewSize;
        const root = state.space.tree[0];
        const element = rendered.container.querySelector(`[data-plurid-plane="${root.planeID}"]`) as HTMLElement;
        expect(element.style.width).toBe(width + 'px');
        expect(element.style.height).toBe(height + 'px');
        const content = element.querySelector('[data-plurid-entity="PluridPlaneContent"]') as HTMLElement;
        expect(content.getAttribute('tabindex')).toBe('-1');
        const bar = element.querySelector('[data-plurid-entity="PluridPlaneControls"]') as HTMLElement | null;
        expect(bar).not.toBeNull();
        expect(getComputedStyle(bar!).position).toBe('absolute');

        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(root.planeID);
        rendered.unmount();
    });

    it('docked on a page, only its lineage stays: a sibling page is set aside (faded, inert) and comes back on the reveal', async () => {
        const Site = () => (
            <div style={{ height: 3000 }}>
                <PluridLink route="/site/about">about</PluridLink>
                <PluridLink route="/site/contact">contact</PluridLink>
            </div>
        );
        const rendered = await renderPlurid({
            planes: [
                { route: '/site', component: Site },
                { route: '/site/about', component: Page },
                { route: '/site/contact', component: Page },
            ],
            view: ['/site'],
            configuration: { space: { presentation: 'page', navigation: { motion: { duration: 0 } } } } as any,
        });
        // jsdom has no layout: give the two links distinct positions (as a browser would measure
        // them), or both pages would hang at the same point and share one dock pose
        const links = rendered.container.querySelectorAll('[data-plurid-link-route]');
        links.forEach((link, index) => {
            Object.defineProperty(link, 'offsetLeft', { value: 200 + index * 300, configurable: true });
            Object.defineProperty(link, 'offsetTop', { value: 24, configurable: true });
            Object.defineProperty(link, 'offsetWidth', { value: 60, configurable: true });
            Object.defineProperty(link, 'offsetHeight', { value: 16, configurable: true });
        });
        const click = (route: string) => act(() => {
            (rendered.container.querySelector(`[data-plurid-link-route$="${route}"]`) as HTMLElement).click();
        });
        click('/about');
        click('/contact');
        const root = rendered.api.getSnapshot().space.tree[0];
        const [about, contact] = root.children!;
        const element = (planeID: string) => rendered.container.querySelector(`[data-plurid-plane="${planeID}"]`) as HTMLElement;

        // docked on contact (the last click): about is aside, the site is not
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(contact.planeID);
        expect(element(about.planeID).getAttribute('data-plurid-aside')).toBe('true');
        expect(element(about.planeID).style.opacity).toBe('0');
        expect(element(about.planeID).style.pointerEvents).toBe('none');
        expect(element(root.planeID).hasAttribute('data-plurid-aside')).toBe(false);
        expect(element(contact.planeID).hasAttribute('data-plurid-aside')).toBe(false);

        // dock on about: contact is aside now
        act(() => { rendered.api.pubsub.publish({ topic: 'space.dock', data: { planeID: about.planeID, animate: false } } as any); });
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(about.planeID);
        expect(element(contact.planeID).getAttribute('data-plurid-aside')).toBe('true');
        expect(element(about.planeID).hasAttribute('data-plurid-aside')).toBe(false);

        // revealed: nothing is aside
        act(() => { rendered.api.pubsub.publish({ topic: 'space.reveal', data: { animate: false } } as any); });
        expect(rendered.view.hasAttribute('data-plurid-docked')).toBe(false);
        expect(element(contact.planeID).hasAttribute('data-plurid-aside')).toBe(false);
        expect(element(contact.planeID).style.opacity).not.toBe('0');
        rendered.unmount();
    });

    it('the space presentation is untouched: no attribute, a content-driven height, the bar in its row', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/page', component: Page }],
            view: ['/page'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const root = rendered.api.getSnapshot().space.tree[0];
        const element = rendered.container.querySelector(`[data-plurid-plane="${root.planeID}"]`) as HTMLElement;
        expect(element.style.height).toBe('');
        expect(rendered.view.hasAttribute('data-plurid-docked')).toBe(false);
        rendered.unmount();
    });
});
// #endregion module
