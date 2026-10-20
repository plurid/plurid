/**
 * @jest-environment jsdom
 */
/**
 * THE ROUTES ARE THE CURRENT ONES (2026-10-20). The router built its registrar and matcher from the
 * first render's `routes`, `planes` and `hostname`, and constructed and threw away a new pair on
 * every render after: a route a host added later was never matched, by a navigation or by the
 * current path. A re-render with the same routes in a new array still remounts nothing.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { pluridRouterNavigate } from '@plurid/plurid-engine';

import PluridRouterBrowser from '../index';
import {
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let mounts = 0;
const counted = (name: string): React.FC => {
    const Page: React.FC = () => {
        React.useEffect(() => {
            mounts += 1;
        }, []);
        return <div data-page={name}>{name}</div>;
    };
    return Page;
};
const A = counted('a');
const B = counted('b');
const routeA = { value: '/a', planes: [['/pa', A]] as any, view: ['/pa'] };
const routeB = { value: '/b', planes: [['/pb', B]] as any, view: ['/pb'] };
const settle = () => act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
});

describe('the router\'s routes after the mount', () => {
    let root: Root;
    let container: HTMLElement;

    beforeEach(() => {
        mounts = 0;
        installPointerEvents();
        installMatchMedia();
        (Element.prototype as any).scrollIntoView = () => {};
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => { root.unmount(); });
        container.remove();
    });

    it('a route added later is matched by a navigation', async () => {
        window.history.replaceState(null, '', '/a');
        await act(async () => {
            root.render(<PluridRouterBrowser routes={[routeA] as any} />);
        });
        await settle();
        expect(container.querySelector('[data-page="a"]')).not.toBeNull();

        await act(async () => {
            root.render(<PluridRouterBrowser routes={[routeA, routeB] as any} />);
        });
        await act(async () => {
            pluridRouterNavigate('/b');
        });
        await settle();
        expect(container.querySelector('[data-page="b"]')).not.toBeNull();
    });

    it('the current path is matched again when its route arrives, and new arrays of the same routes remount nothing', async () => {
        window.history.replaceState(null, '', '/b');
        await act(async () => {
            root.render(<PluridRouterBrowser routes={[routeA] as any} />);
        });
        await settle();
        expect(container.querySelector('[data-page="b"]')).toBeNull();

        await act(async () => {
            root.render(<PluridRouterBrowser routes={[routeA, routeB] as any} />);
        });
        await settle();
        expect(container.querySelector('[data-page="b"]')).not.toBeNull();
        const mounted = mounts;

        for (let render = 0; render < 3; render += 1) {
            await act(async () => {
                root.render(<PluridRouterBrowser routes={[routeA, routeB] as any} />);
            });
        }
        await settle();
        expect(mounts).toBe(mounted);
        expect(container.querySelectorAll('[data-page="b"]')).toHaveLength(1);
    });
});
