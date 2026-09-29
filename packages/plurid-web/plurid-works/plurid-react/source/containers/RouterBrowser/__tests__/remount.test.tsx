/**
 * @jest-environment jsdom
 */
/**
 * A HOST RE-RENDER IS NOT A NAVIGATION (2026-09-29). The router's default shell was declared inside
 * its render, a new component type every time, and the route was computed again on the first
 * re-render after mount: a theme toggle above the router unmounted the routed application, took its
 * camera, spawned planes and history, and fired `onReady` again. The route is computed again only
 * when the path changes.
 */
import React, { act, useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { pluridRouterNavigate } from '@plurid/plurid-engine';

import PluridRouterBrowser from '../index';
import {
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let mounts = 0;
const Page: React.FC = () => {
    useEffect(() => {
        mounts += 1;
    }, []);
    return <div data-page>page</div>;
};

const routes = [
    { value: '/', planes: [['/p', Page]] as any, view: ['/p'] },
    { value: '/other', planes: [['/q', Page]] as any, view: ['/q'] },
];

const Shell: React.FC<{ children?: React.ReactNode }> = ({ children }) => <main>{children}</main>;


describe('the router under a host that re-renders', () => {
    let root: Root;
    let container: HTMLElement;
    let rerender: () => void = () => {};

    const Host = (
        properties: { onReady: () => void; shell?: boolean },
    ) => {
        const [, setTick] = useState(0);
        rerender = () => setTick((tick) => tick + 1);
        return (
            <PluridRouterBrowser
                routes={routes as any}
                onReady={properties.onReady}
                shell={properties.shell ? Shell : undefined}
            />
        );
    };

    beforeEach(() => {
        mounts = 0;
        installPointerEvents();
        installMatchMedia();
        (Element.prototype as any).scrollIntoView = () => {};
        window.history.replaceState(null, '', '/');
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => { root.unmount(); });
        container.remove();
    });

    for (const shell of [false, true]) {
        it(`keeps the routed application mounted ${shell ? 'with' : 'without'} a shell`, async () => {
            const onReady = jest.fn();
            await act(async () => {
                root.render(<Host onReady={onReady} shell={shell} />);
            });
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0));
            });
            expect(mounts).toBe(1);
            expect(onReady).toHaveBeenCalledTimes(1);

            for (let render = 0; render < 3; render += 1) {
                await act(async () => {
                    rerender();
                });
            }
            expect(mounts).toBe(1);
            expect(onReady).toHaveBeenCalledTimes(1);
            expect(container.querySelectorAll('[data-page]')).toHaveLength(1);

            // a NAVIGATION still routes: a new path, a new application
            await act(async () => {
                pluridRouterNavigate('/other');
            });
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0));
            });
            expect(mounts).toBe(2);
            expect(window.location.pathname).toBe('/other');
        });
    }
});
