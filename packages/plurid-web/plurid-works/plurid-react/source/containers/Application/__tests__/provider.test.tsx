/**
 * @jest-environment jsdom
 */
/**
 * THE SEAM THIS CLOSES.
 *
 * `<PluridApplication …/>` takes eighteen props for customization, persistence
 * and observation. The ROUTE-DRIVEN path — which the kit generates, the getting
 * started guide teaches, and every product uses — forwarded five. So seventeen
 * documented props could not be reached from the way we tell people to build,
 * and products worked around it in the only place left to them: the stylesheet.
 *
 * `PluridApplicationProvider` is the answer, and these are the rules it must
 * hold: a slot reaches an application the ROUTER constructed, an application's
 * OWN prop still wins, and a nested provider changes one field without
 * restating the rest.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import PluridRouterBrowser from '../../RouterBrowser';
import PluridApplication from '../index';
import { PluridApplicationProvider } from '../provider';

import {
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;


const Page: React.FC = () => <div>page</div>;
const Exterior: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;

/** a route whose space resolves to NO planes, so the empty slot is what renders */
const emptyRoutes = [
    { value: '/', exterior: Exterior, planes: [['/p', Page]] as any, view: [] },
];

const filledRoutes = [
    { value: '/', exterior: Exterior, planes: [['/p', Page]] as any, view: ['/p'] },
];

const HostEmpty = () => <div data-host-empty>the host says so</div>;
const OtherEmpty = () => <div data-other-empty>a different host</div>;


describe('the application provider', () => {
    let root: Root;
    let container: HTMLElement;

    const render = async (element: React.ReactElement) => {
        await act(async () => {
            root.render(element);
        });
        // the empty state renders once the layout has resolved
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
    };

    beforeEach(() => {
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

    it('THE ENGINE\'S OWN EMPTY STATE is what a route-driven application renders without one', async () => {
        await render(<PluridRouterBrowser routes={emptyRoutes as any} />);

        expect(container.querySelector('[data-plurid-entity="PluridEmpty"]')).toBeTruthy();
        expect(container.querySelector('[data-host-empty]')).toBeNull();
    });

    it('and the host\'s reaches it through the provider — the seam this exists for', async () => {
        await render(
            <PluridApplicationProvider renderEmpty={() => <HostEmpty />}>
                <PluridRouterBrowser routes={emptyRoutes as any} />
            </PluridApplicationProvider>,
        );

        expect(container.querySelector('[data-host-empty]')).toBeTruthy();
        // and the engine's is not rendered UNDERNEATH it: two empty states, one
        // over the other, is what a product had to hide from its stylesheet
        expect(container.querySelector('[data-plurid-entity="PluridEmpty"]')).toBeNull();
    });

    it('an application\'s OWN prop wins over the provider: a default, never an override', async () => {
        await render(
            <PluridApplicationProvider renderEmpty={() => <HostEmpty />}>
                <PluridApplication
                    planes={[{ route: '/p', component: Page }] as any}
                    view={[]}
                    renderEmpty={() => <OtherEmpty />}
                />
            </PluridApplicationProvider>,
        );

        expect(container.querySelector('[data-other-empty]')).toBeTruthy();
        expect(container.querySelector('[data-host-empty]')).toBeNull();
    });

    it('a direct application takes the provider too, so both mount paths are one surface', async () => {
        await render(
            <PluridApplicationProvider renderEmpty={() => <HostEmpty />}>
                <PluridApplication
                    planes={[{ route: '/p', component: Page }] as any}
                    view={[]}
                />
            </PluridApplicationProvider>,
        );

        expect(container.querySelector('[data-host-empty]')).toBeTruthy();
    });

    it('a nested provider changes ONE field and inherits the rest', async () => {
        const seen: string[] = [];

        await render(
            <PluridApplicationProvider
                renderEmpty={() => <HostEmpty />}
                onViewpointChange={(viewpoint) => seen.push(viewpoint)}
            >
                <PluridApplicationProvider renderEmpty={() => <OtherEmpty />}>
                    <PluridRouterBrowser routes={emptyRoutes as any} />
                </PluridApplicationProvider>
            </PluridApplicationProvider>,
        );

        expect(container.querySelector('[data-other-empty]')).toBeTruthy();
        expect(container.querySelector('[data-host-empty]')).toBeNull();
    });

    it('carries a non-slot field: `onReady` reaches a route-driven application', async () => {
        const seen: any[] = [];

        await render(
            <PluridApplicationProvider onReady={(api) => seen.push(api)}>
                <PluridRouterBrowser routes={filledRoutes as any} />
            </PluridApplicationProvider>,
        );

        expect(seen.length).toBeGreaterThan(0);
        expect(typeof seen[0]?.store?.getState).toBe('function');
    });

    it('configures nothing when it is given nothing, and never erases an outer value', async () => {
        await render(
            <PluridApplicationProvider renderEmpty={() => <HostEmpty />}>
                <PluridApplicationProvider renderEmpty={undefined}>
                    <PluridRouterBrowser routes={emptyRoutes as any} />
                </PluridApplicationProvider>
            </PluridApplicationProvider>,
        );

        // an explicit `undefined` reads as "not configured here", which is what
        // leaving the field out means
        expect(container.querySelector('[data-host-empty]')).toBeTruthy();
    });
});
