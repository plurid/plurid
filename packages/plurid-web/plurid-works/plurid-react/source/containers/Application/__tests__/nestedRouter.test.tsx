/**
 * @jest-environment jsdom
 */
/**
 * THE ROUTER SPEAKS TO THE APPLICATION ITS ROUTE RENDERS, NOT TO ONE INSIDE A PLANE (2026-10-20).
 * The router's context wraps everything it renders and nothing reset it: an application nested in a
 * plane of the routed one took the router's bus and `onReady` too, so the router's `onReady` fired
 * twice and a command on the router's bus reached both spaces.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import PluridPubSub from '@plurid/plurid-pubsub';

import PluridApplication from '../index';
import PluridRouterContext from '../../RouterBrowser/context';
import {
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const Inner: React.FC = () => <div data-inner>inner</div>;
const inner = React.createRef<any>();
const Outer: React.FC = () => (
    <div style={{ width: 400, height: 300 }}>
        <PluridApplication
            ref={inner}
            planes={[{ route: '/inner', component: Inner }] as any}
            view={['/inner']}
        />
    </div>
);

describe('an application inside a plane, under a router', () => {
    it('keeps its own bus and readiness: the router\'s are the routed application\'s', async () => {
        installPointerEvents();
        installMatchMedia();
        const bus = new PluridPubSub();
        const ready = jest.fn();
        let outerApi: any;
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        await act(async () => {
            root.render(
                <PluridRouterContext.Provider value={{ path: '/', navigate: () => {}, onReady: (api) => { outerApi = api; ready(api); }, pubsub: bus }}>
                    <PluridApplication
                        planes={[{ route: '/outer', component: Outer }] as any}
                        view={['/outer']}
                    />
                </PluridRouterContext.Provider>,
            );
        });
        await act(async () => {});

        expect(container.querySelector('[data-inner]')).not.toBeNull();
        expect(ready).toHaveBeenCalledTimes(1);
        expect(outerApi.pubsub).toBe(bus);
        expect(inner.current.pubsub).not.toBe(bus);

        await act(async () => {
            bus.publish({ topic: 'space.selectAll' } as any);
        });
        expect(outerApi.getSnapshot().space.selectedPlaneIDs.length).toBeGreaterThan(0);
        expect(inner.current.selection.get()).toEqual([]);

        await act(async () => {
            root.unmount();
        });
        container.remove();
    });

    it('leaves the pathname to the router: an inner address bar rides the query (2026-10-22)', async () => {
        // The reset took the router's hold on the pathname away with its bus: an inner application in
        // the page presentation bound the address bar in path mode and wrote its page over the route.
        installPointerEvents();
        installMatchMedia();
        window.history.replaceState({}, '', '/outer');
        const Paged: React.FC = () => (
            <div style={{ width: 400, height: 300 }}>
                <PluridApplication
                    planes={[{ route: '/inner', component: Inner }] as any}
                    view={['/inner']}
                    configuration={{ space: { presentation: 'page' } } as any}
                />
            </div>
        );
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        await act(async () => {
            root.render(
                <PluridRouterContext.Provider value={{ path: '/outer', navigate: () => {}, onReady: () => {} }}>
                    <PluridApplication
                        planes={[{ route: '/outer', component: Paged }] as any}
                        view={['/outer']}
                    />
                </PluridRouterContext.Provider>,
            );
        });
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });
        expect(container.querySelector('[data-inner]')).not.toBeNull();
        expect(window.location.pathname).toBe('/outer');

        await act(async () => {
            root.unmount();
        });
        container.remove();
    });
});
