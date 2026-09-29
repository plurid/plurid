/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, { act, createContext, useContext } from 'react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
    } from '../../../../testing';

    import PluridLink from '~components/links/Link';
    // #endregion external
// #endregion imports



// #region module
/**
 * A SPAWNED CHILD READS THE HOST'S CONTEXT AS IT IS NOW (2026-09-29). The children of a root were
 * built once per tree change: a child kept the `planeContextValue` of the moment it was spawned.
 */
const UserContext = createContext<{ user: string }>({ user: 'nobody' });

const Who = () => {
    const { user } = useContext(UserContext);
    return <div data-who>{user}</div>;
};

const Root = () => (
    <div>
        <Who />
        <PluridLink route="/child">open</PluridLink>
    </div>
);


describe('a spawned child plane', () => {
    it('renders the host\'s current plane context value', async () => {
        const properties = {
            planes: [
                { route: '/root', component: Root },
                { route: '/child', component: Who },
            ],
            view: ['/root'],
            planeContext: UserContext,
            planeContextValue: { user: 'anonymous' },
            configuration: { space: { navigation: { motion: { duration: 0 } } } },
        } as any;
        const rendered = await renderPlurid(properties);

        const link = rendered.container.querySelector('[data-plurid-entity="PluridLink"]') as HTMLElement;
        await act(async () => {
            link.click();
        });
        const values = () => Array.from(rendered.container.querySelectorAll('[data-who]')).map((node) => node.textContent);
        expect(values()).toEqual(['anonymous', 'anonymous']);

        await rendered.rerender({ ...properties, planeContextValue: { user: 'alice' } });
        expect(values()).toEqual(['alice', 'alice']);
        await rendered.unmount();
    });
});
// #endregion module
