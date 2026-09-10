/**
 * @jest-environment jsdom
 */
/**
 * The router's location handler is subscribed once (`popstate`), so it must read the CURRENT props —
 * a host that turns clean navigation on after mount, or changes its `view`, is honoured on the next
 * location change (the handler used to close over the first render's props).
 */
import React, { act, useContext, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';

import PluridRouterBrowser from '../index';
import PluridRouterContext from '../context';
import {
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



const Page: React.FC = () => <div>page</div>;
/** The route's exterior: renders what the context carries (a name on the bus, the path) and calls its `onReady`. */
const Reader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const context = useContext(PluridRouterContext);
    const onReady = context?.onReady;
    useEffect(() => {
        onReady?.({ marker: 'from the route' } as any);
    }, [onReady]);
    return (
        <div>
            <output data-router-path>{context?.path ?? ''}</output>
            <output data-router-bus>{(context?.pubsub as { name?: string } | undefined)?.name ?? ''}</output>
            {children}
        </div>
    );
};

const routes = [
    { value: '/', exterior: Reader, planes: [['/p', Page]] as any, view: ['/p'] },
    { value: '/other', exterior: Reader, planes: [['/q', Page]] as any, view: ['/q'] },
];

describe('the router reads its current props on a location change', () => {
    let root: Root;
    let container: HTMLElement;

    beforeEach(() => {
        installPointerEvents();
        installMatchMedia();
        // jsdom has no scrollIntoView (the router scrolls to its top on a location change)
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

    it('clean navigation turned on after mount routes the next popstate to the current view', async () => {
        await act(async () => {
            root.render(<PluridRouterBrowser routes={routes as any} cleanNavigation={false} />);
        });
        expect(container.querySelector('[data-router-path]')!.textContent).toBe('/');

        await act(async () => {
            root.render(<PluridRouterBrowser routes={routes as any} cleanNavigation={true} view="/other" />);
        });
        await act(async () => {
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
        expect(container.querySelector('[data-router-path]')!.textContent).toBe('/other');
    });

    it('carries the router\'s onReady and bus to what it renders (the readiness contract); the context\'s onReady reaches the host\'s current one', async () => {
        const seen: any[] = [];
        const bus = { name: 'the host bus', publish: () => {}, subscribe: () => 's', unsubscribe: () => {} } as any;
        await act(async () => {
            root.render(<PluridRouterBrowser routes={routes as any} onReady={(api) => { seen.push(api); }} pubsub={bus} />);
        });
        expect(container.querySelector('[data-router-bus]')!.textContent).toBe('the host bus');
        expect(seen.some((api) => api?.marker === 'from the route')).toBe(true);
        // the host swaps its onReady: the context's function is the same, the new host function is what it calls
        const later: any[] = [];
        await act(async () => {
            root.render(<PluridRouterBrowser routes={routes as any} onReady={(api) => { later.push(api); }} pubsub={bus} />);
        });
        await act(async () => {
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
        expect(later.length).toBeGreaterThan(0);
    });

});
