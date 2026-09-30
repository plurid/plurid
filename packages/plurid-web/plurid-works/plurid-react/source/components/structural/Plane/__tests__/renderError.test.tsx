/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, { act } from 'react';
    import { createRoot, Root } from 'react-dom/client';

    import PluridPubSub from '@plurid/plurid-pubsub';

    import {
        PLURID_PUBSUB_TOPIC,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        installPointerEvents,
        installMatchMedia,
    } from '../../../../testing';

    import PluridRouterBrowser from '~containers/RouterBrowser';
    import { PluridApplicationProvider } from '~containers/Application/provider';

    import type {
        PluridPlaneErrorProperties,
    } from '~components/utilities/ErrorBoundary';
    // #endregion external
// #endregion imports



// #region module
/**
 * ONE PLANE'S BUG IS ONE PLANE'S (2026-09-29). The boundary was on only when a host passed
 * `planeRenderError`, which the docs and the type said defaulted to `true`: one throwing plane
 * unmounted the whole application, and a route-driven application had no way to pass it. A host's
 * own error component never rendered (the boundary returned the function itself), and nothing
 * told the host what had been caught.
 */
const Good = () => <div data-good>good</div>;
const Bad = () => {
    throw new Error('boom in plane');
};

const quietly = async <T,>(run: () => Promise<T>): Promise<T> => {
    // React reports every caught render error to the console; the test reads the DOM and the bus
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        return await run();
    } finally {
        errors.mockRestore();
    }
};


describe('a plane that throws', () => {
    it('shows its error card, the rest of the space goes on, and the bus hears of it', async () => {
        await quietly(async () => {
            const bus = new PluridPubSub({ onDrop: null });
            const changed: { kind: string; value: any }[] = [];
            bus.subscribe({ topic: PLURID_PUBSUB_TOPIC.CHANGED, callback: (data: any) => changed.push(data) } as any);

            const rendered = await renderPlurid({
                planes: [
                    { route: '/good', component: Good },
                    { route: '/bad', component: Bad },
                ],
                view: ['/good', '/bad'],
                pubsub: bus,
            } as any);

            expect(rendered.container.querySelector('[data-good]')).not.toBeNull();
            expect(rendered.container.querySelectorAll('[data-plurid-entity="PluridPlaneError"]')).toHaveLength(1);
            const bad = rendered.api.getSnapshot().space.tree.find((plane: any) => plane.route.endsWith('/bad'))!;
            const reported = changed.filter((change) => change.kind === 'planeError').map((change) => change.value);
            expect(reported).toContainEqual({ planeID: bad.planeID, route: bad.route, message: 'boom in plane' });
            await rendered.unmount();
        });
    });

    it('renders a host\'s own error component, with the error and a retry', async () => {
        await quietly(async () => {
            // broken until the test mends it: the retry is what brings it back
            let mended = false;
            const Flaky = () => {
                if (!mended) {
                    throw new Error('not yet');
                }
                return <div data-flaky>recovered</div>;
            };
            const Fallback = ({ error, retry }: PluridPlaneErrorProperties) => (
                <button type="button" data-fallback onClick={retry}>
                    {(error as Error).message}
                </button>
            );

            const rendered = await renderPlurid({
                planes: [{ route: '/flaky', component: Flaky }],
                view: ['/flaky'],
                planeRenderError: Fallback,
            } as any);

            const fallback = rendered.container.querySelector('[data-fallback]') as HTMLButtonElement;
            expect(fallback).not.toBeNull();
            expect(fallback.textContent).toBe('not yet');
            expect(rendered.container.querySelector('[data-plurid-entity="PluridPlaneError"]')).toBeNull();

            mended = true;
            await act(async () => {
                fallback.click();
            });
            expect(rendered.container.querySelector('[data-flaky]')).not.toBeNull();
            expect(rendered.container.querySelector('[data-fallback]')).toBeNull();
            await rendered.unmount();
        });
    });

    it('a component that is not a React component (an ElementQL name) shows the card, root or spawned', async () => {
        await quietly(async () => {
            const bus = new PluridPubSub({ onDrop: null });
            const changed: { kind: string; value: any }[] = [];
            bus.subscribe({ topic: PLURID_PUBSUB_TOPIC.CHANGED, callback: (data: any) => changed.push(data) } as any);

            const rendered = await renderPlurid({
                planes: [
                    { route: '/good', component: Good },
                    { route: '/named', component: 'Home' },
                ],
                view: ['/good', '/named'],
                pubsub: bus,
            } as any);

            // a root rendered the name as an element (`<home>`), blank
            expect(rendered.container.querySelector('home')).toBeNull();
            expect(rendered.container.querySelector('[data-good]')).not.toBeNull();
            expect(rendered.container.querySelectorAll('[data-plurid-entity="PluridPlaneError"]')).toHaveLength(1);
            const messages = changed.filter((change) => change.kind === 'planeError').map((change) => change.value.message);
            expect(messages[0]).toMatch(/not a React component \("Home"\)/);

            // a spawned child rendered nothing at all
            const good = rendered.api.getSnapshot().space.tree.find((plane: any) => plane.route.endsWith('/good'))!;
            await act(async () => {
                rendered.handle.tree.spawn('/named', good.planeID);
            });
            expect(rendered.container.querySelectorAll('[data-plurid-entity="PluridPlaneError"]')).toHaveLength(2);
            await rendered.unmount();
        });
    });

    it('is contained in a route-driven application, and the provider sets its error component', async () => {
        installPointerEvents();
        installMatchMedia();
        (Element.prototype as any).scrollIntoView = () => {};
        window.history.replaceState(null, '', '/');
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root: Root = createRoot(container);
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

        const Fallback = () => <div data-provided>the host's card</div>;
        const Exterior: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
        const routes = [
            { value: '/', exterior: Exterior, planes: [['/good', Good], ['/bad', Bad]] as any, view: ['/good', '/bad'] },
        ];

        await quietly(async () => {
            await act(async () => {
                root.render(
                    <PluridApplicationProvider planeRenderError={Fallback}>
                        <PluridRouterBrowser routes={routes as any} />
                    </PluridApplicationProvider>,
                );
            });
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0));
            });
        });

        expect(container.querySelector('[data-good]')).not.toBeNull();
        expect(container.querySelector('[data-provided]')).not.toBeNull();

        await act(async () => {
            root.unmount();
        });
        container.remove();
    });
});
// #endregion module
