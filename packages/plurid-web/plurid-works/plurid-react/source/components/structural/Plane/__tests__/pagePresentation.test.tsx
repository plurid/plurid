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
        gestures,
        flushFrames,
        installFrameClock,
        RenderPluridProperties,
    } from '../../../../testing';
    import actions from '~services/state/actions';
    import PluridLink from '../../../links/Link';
    // #endregion external
// #endregion imports



// #region module
const Page = () => <div style={{ height: 3000 }}>a long page</div>;

/** The page presentation, instant moves. */
const page: RenderPluridProperties['configuration'] = {
    space: { presentation: 'page', navigation: { motion: { duration: 0 } } },
};

describe('the page presentation', () => {
    it('renders every plane view-sized with a scrolling content row, the bar as an overlay, and the view docked', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/page', component: Page }],
            view: ['/page'],
            configuration: page,
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
        expect(rendered.handle.camera.docked()).toBe(root.planeID);
        await rendered.unmount();
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
            configuration: page,
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
        expect(element(about.planeID).hasAttribute('inert')).toBe(true);
        expect(element(about.planeID).style.opacity).toBe('0');
        expect(element(about.planeID).style.pointerEvents).toBe('none');
        expect(element(root.planeID).hasAttribute('data-plurid-aside')).toBe(false);
        expect(element(contact.planeID).hasAttribute('data-plurid-aside')).toBe(false);

        // dock on about (the typed handle): contact is aside now
        act(() => { rendered.handle.camera.dock(about.planeID, { animate: false }); });
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(about.planeID);
        expect(element(contact.planeID).getAttribute('data-plurid-aside')).toBe('true');
        expect(element(about.planeID).hasAttribute('data-plurid-aside')).toBe(false);

        // revealed (the topic): nothing is aside
        act(() => { rendered.api.pubsub.publish({ topic: 'space.reveal', data: { animate: false } }); });
        expect(rendered.view.hasAttribute('data-plurid-docked')).toBe(false);
        expect(element(contact.planeID).hasAttribute('data-plurid-aside')).toBe(false);
        expect(element(contact.planeID).hasAttribute('inert')).toBe(false);
        expect(element(contact.planeID).style.opacity).not.toBe('0');
        await rendered.unmount();
    });

    it('two fingers inside the page are the space\'s: a pinch undocks it and the chrome comes back', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes: [{ route: '/page', component: Page }],
            view: ['/page'],
            configuration: page,
        });
        const root = rendered.api.getSnapshot().space.tree[0];
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(root.planeID);
        const content = rendered.container.querySelector('[data-plurid-entity="PluridPlaneContent"]') as HTMLElement;
        await gestures.pinch(content, { x: 500, y: 300 }, 300, 150);
        await flushFrames(2);
        expect(rendered.api.getSnapshot().space.camera.scale).toBeLessThan(0.99);
        expect(rendered.view.hasAttribute('data-plurid-docked')).toBe(false);
        await rendered.unmount();
        clock.restore();
    });

    it('Space held inside the page: while docked it is the page\'s (no grab); on the revealed page it grabs', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/page', component: Page }],
            view: ['/page'],
            configuration: page,
        });
        const content = rendered.container.querySelector('[data-plurid-entity="PluridPlaneContent"]') as HTMLElement;
        const hold = () => {
            act(() => { content.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, code: 'Space', key: ' ' })); });
            const held = rendered.api.getSnapshot().ui.grabHold;
            act(() => { window.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, code: 'Space', key: ' ' })); });
            return held;
        };
        expect(rendered.view.getAttribute('data-plurid-docked')).not.toBeNull();
        expect(hold()).toBe(false);
        act(() => { rendered.handle.camera.reveal({ animate: false }); });
        expect(rendered.view.hasAttribute('data-plurid-docked')).toBe(false);
        expect(hold()).toBe(true);
        expect(rendered.api.getSnapshot().ui.grabHold).toBe(false);
        await rendered.unmount();
    });

    it('the docked page is followed: when its geometry changes under the camera, the camera re-docks on it', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/page', component: Page }],
            view: ['/page'],
            configuration: page,
        });
        const root = rendered.api.getSnapshot().space.tree[0];
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(root.planeID);
        // the page becomes a declared 600 × 400 box: its dock pose is its own center now
        act(() => {
            rendered.api.store.dispatch(actions.space.setPlaneSize({ planeID: root.planeID, width: 600, height: 400, sizeMode: 'manual' }));
        });
        const state = rendered.api.getSnapshot();
        expect(state.space.tree[0].width).toBe(600);
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(root.planeID);
        expect(state.space.camera.pivot.x).toBeCloseTo(root.location.translateX + 300, 6);
        expect(state.space.camera.pivot.y).toBeCloseTo(root.location.translateY + 200, 6);
        // the re-dock reads the box at its FILL scale (2026-09-06): the 600 × 400 box fills the view along its tighter side
        expect(state.space.camera.scale).toBeCloseTo(Math.min(state.space.viewSize.width / 600, state.space.viewSize.height / 400), 6);
        await rendered.unmount();
    });

    it('the space presentation is untouched: no attribute, a content-driven height, the bar in its row', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/page', component: Page }],
            view: ['/page'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } },
        });
        const root = rendered.api.getSnapshot().space.tree[0];
        const element = rendered.container.querySelector(`[data-plurid-plane="${root.planeID}"]`) as HTMLElement;
        expect(element.style.height).toBe('');
        expect(rendered.view.hasAttribute('data-plurid-docked')).toBe(false);
        expect(rendered.handle.camera.docked()).toBe('');
        await rendered.unmount();
    });
});
// #endregion module
