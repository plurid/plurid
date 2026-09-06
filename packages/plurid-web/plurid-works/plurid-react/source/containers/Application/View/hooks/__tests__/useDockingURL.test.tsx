/**
 * @jest-environment jsdom
 */
/**
 * The address bar is the page (`space.docking.url`): the docked page's path in the location, a deep link
 * docked on load, Back docking the entry's page — and the query mode inside a router.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import PluridApplication from '../../../index';
import PluridRouterContext from '../../../../RouterBrowser/context';
import PluridLink from '../../../../../components/links/Link';
import {
    renderPlurid,
    RenderPluridProperties,
    installPointerEvents,
    installMatchMedia,
} from '../../../../../testing';



const Page: React.FC = () => <div style={{ height: 2000 }}>page</div>;
const Site: React.FC = () => (
    <div style={{ height: 3000 }}>
        <PluridLink route="/site/about">about</PluridLink>
    </div>
);
const page: RenderPluridProperties['configuration'] = {
    space: { presentation: 'page', navigation: { motion: { duration: 0 } } },
};
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
/** The restore and the write run in effects after the boot's measurement: let them land. */
const flush = () => act(async () => { await wait(40); });

/** jsdom has no layout: a link needs a position for the spawn to place the page. */
const shimLinks = (container: HTMLElement) => {
    container.querySelectorAll('[data-plurid-link-route]').forEach((link, index) => {
        Object.defineProperty(link, 'offsetLeft', { value: 200 + index * 300, configurable: true });
        Object.defineProperty(link, 'offsetTop', { value: 24, configurable: true });
        Object.defineProperty(link, 'offsetWidth', { value: 60, configurable: true });
        Object.defineProperty(link, 'offsetHeight', { value: 16, configurable: true });
    });
};


describe('the address bar is the page', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/');
    });

    it('docked at boot, the page path replaces the entry (no history added), the query kept; the space presentation writes nothing', async () => {
        window.history.replaceState(null, '', '/?fixture=page-docked');
        const length = window.history.length;
        const rendered = await renderPlurid({ planes: [{ route: '/page', component: Page }], view: ['/page'], configuration: page });
        await flush();
        expect(rendered.view.getAttribute('data-plurid-docked')).toBeTruthy();
        expect(window.location.pathname).toBe('/page');
        expect(window.location.search).toBe('?fixture=page-docked');
        expect(window.history.length).toBe(length);
        expect((window.history.state as any)?.plurid?.docked).toBe(rendered.api.getSnapshot().space.tree[0].planeID);
        await rendered.unmount();

        window.history.replaceState(null, '', '/');
        const space = await renderPlurid({ planes: [{ route: '/page', component: Page }], view: ['/page'] });
        await flush();
        expect(window.location.pathname).toBe('/');
        await space.unmount();
    });

    it('a deep link to a root boots docked on it; an explicit url: false leaves the location alone', async () => {
        window.history.replaceState(null, '', '/two');
        const rendered = await renderPlurid({
            planes: [{ route: '/one', component: Page }, { route: '/two', component: Page }],
            view: ['/one', '/two'],
            configuration: page,
        });
        await flush();
        const [one, two] = rendered.api.getSnapshot().space.tree;
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(two.planeID);
        expect(window.location.pathname).toBe('/two');
        await rendered.unmount();

        window.history.replaceState(null, '', '/two');
        const off = await renderPlurid({
            planes: [{ route: '/one', component: Page }, { route: '/two', component: Page }],
            view: ['/one', '/two'],
            configuration: { space: { presentation: 'page', docking: { url: false }, navigation: { motion: { duration: 0 } } } },
        });
        await flush();
        expect(off.view.getAttribute('data-plurid-docked')).toBe(one.planeID);
        expect(window.location.pathname).toBe('/two');
        await off.unmount();
    });

    it('a link click pushes the child page; the reveal keeps the path; Back docks the parent and pushes nothing', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/site', component: Site }, { route: '/site/about', component: Page }],
            view: ['/site'],
            configuration: page,
        });
        await flush();
        expect(window.location.pathname).toBe('/site');
        const length = window.history.length;
        shimLinks(rendered.container);
        await act(async () => {
            (rendered.container.querySelector('[data-plurid-link-route$="/about"]') as HTMLElement).click();
        });
        await flush();
        const root = rendered.api.getSnapshot().space.tree[0];
        const about = root.children![0];
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(about.planeID);
        expect(window.location.pathname).toBe('/site/about');
        expect(window.history.length).toBe(length + 1);

        await act(async () => { rendered.handle.camera.reveal({ animate: false }); });
        await flush();
        expect(rendered.view.getAttribute('data-plurid-docked')).toBeNull();
        expect(window.location.pathname).toBe('/site/about');

        // Back: the browser moves to the parent's entry, the engine docks the parent
        await act(async () => {
            window.history.replaceState({ plurid: { docked: root.planeID, path: '/site' } }, '', '/site');
            window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
        });
        await flush();
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(root.planeID);
        expect(window.location.pathname).toBe('/site');
        await rendered.unmount();
    });

    it('a deep link to a page that is registered but not shown spawns it behind its parent through the link and docks it', async () => {
        window.history.replaceState(null, '', '/site/about?x=1');
        const rendered = await renderPlurid({
            planes: [{ route: '/site', component: Site }, { route: '/site/about', component: Page }],
            view: ['/site'],
            configuration: page,
        });
        shimLinks(rendered.container);
        await act(async () => { await wait(120); });
        const root = rendered.api.getSnapshot().space.tree[0];
        const about = root.children?.[0];
        expect(about).toBeDefined();
        expect(about!.parentPlaneID).toBe(root.planeID);
        expect(about!.spawnedByLinkID).toBeTruthy();
        expect(rendered.view.getAttribute('data-plurid-docked')).toBe(about!.planeID);
        expect(window.location.pathname).toBe('/site/about');
        expect(window.location.search).toBe('?x=1');
        await rendered.unmount();
    });

    it('inside a router the page rides a query parameter by replaceState and boots from it', async () => {
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
        installPointerEvents();
        installMatchMedia();
        window.history.replaceState(null, '', '/route?page=%2Ftwo');
        const length = window.history.length;
        const container = document.createElement('div');
        document.body.appendChild(container);
        let api: any;
        let root: Root | undefined;
        await act(async () => {
            root = createRoot(container);
            root.render(
                <PluridRouterContext.Provider value={{ path: '/route', navigate: () => {} }}>
                    <PluridApplication
                        planes={[{ route: '/one', component: Page }, { route: '/two', component: Page }] as any}
                        view={['/one', '/two'] as any}
                        configuration={page as any}
                        onReady={(instance) => { api = instance; }}
                    />
                </PluridRouterContext.Provider>,
            );
        });
        await flush();
        const [one, two] = api.getSnapshot().space.tree;
        expect(container.querySelector('[data-plurid-entity="PluridView"]')?.getAttribute('data-plurid-docked')).toBe(two.planeID);
        expect(window.location.pathname).toBe('/route');
        await act(async () => { api.pubsub.publish({ topic: 'space.dock', data: { planeID: one.planeID, animate: false } }); });
        await flush();
        expect(new URLSearchParams(window.location.search).get('page')).toBe('/one');
        expect(window.location.pathname).toBe('/route');
        expect(window.history.length).toBe(length);
        await act(async () => { root!.unmount(); });
        container.remove();
    });
});
