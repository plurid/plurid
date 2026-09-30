/**
 * @jest-environment jsdom
 */
/**
 * THE PUBLISHED TYPES SAY WHAT THE COMPONENTS TAKE (2026-09-29). Checked by the type-check (`pnpm
 * check` compiles the tests): each `@ts-expect-error` fails it if the type loosens again.
 *
 * A render slot returns a React node. The data package types a slot's result as `unknown` (it is
 * framework-free), so `renderMinimap={() => ({ not: 'a node' })}` compiled and then took the whole
 * application down with "Objects are not valid as a React child".
 *
 * A connected component's props are its own. react-redux's `store` and `context` are the engine's
 * plumbing, and they showed in the published props as if a host should pass them.
 */
import React from 'react';

import {
    PluridApplicationConfigurator,
    PluridPlaneConfigurator,
    PluridExternalPlane,
    PluridIframePlane,
    PluridVirtualList,
} from '../../../index';

import type {
    PluridApplicationProperties,
    PluridApplicationDefaults,
} from '../../../index';

import type {
    RenderPluridProperties,
} from '../../../testing';



describe('the render slots\' types', () => {
    it('take what React renders, with their context typed', () => {
        const properties: Partial<PluridApplicationProperties> = {
            renderMinimap: () => <div />,
            renderEmpty: () => null,
            renderToolbar: (context) => (context.presentation === 'page' ? 'page' : 'space'),
            renderPlaneControls: (context) => <span>{context.planeID}</span>,
        };
        expect(Object.keys(properties)).toHaveLength(4);
    });

    it('refuse what React cannot render, on the application, the provider and the test renderer', () => {
        const application: Partial<PluridApplicationProperties> = {
            // @ts-expect-error an object is not a React node
            renderMinimap: () => ({ not: 'a node' }),
        };
        const defaults: PluridApplicationDefaults = {
            // @ts-expect-error an object is not a React node
            renderEmpty: () => ({ not: 'a node' }),
        };
        const rendered: RenderPluridProperties = {
            // @ts-expect-error an object is not a React node
            renderToolbar: () => ({ not: 'a node' }),
        };
        expect([application, defaults, rendered]).toHaveLength(3);
    });
});


describe('the connected components\' types', () => {
    it('take their own props, never react-redux\'s store or context', () => {
        const list: Partial<React.ComponentProps<typeof PluridVirtualList>> = {
            items: [],
            // @ts-expect-error `store` is react-redux's, not a host's
            store: undefined,
        };
        const applicationConfigurator: Partial<React.ComponentProps<typeof PluridApplicationConfigurator>> = {
            configuration: {},
            // @ts-expect-error `context` is react-redux's, not a host's
            context: undefined,
        };
        const planeConfigurator: Partial<React.ComponentProps<typeof PluridPlaneConfigurator>> = {
            // @ts-expect-error `store` is react-redux's, not a host's
            store: undefined,
        };
        const external: Partial<React.ComponentProps<typeof PluridExternalPlane>> = {
            // @ts-expect-error `store` is react-redux's, not a host's
            store: undefined,
        };
        const iframe: Partial<React.ComponentProps<typeof PluridIframePlane>> = {
            // @ts-expect-error `context` is react-redux's, not a host's
            context: undefined,
        };
        expect([list, applicationConfigurator, planeConfigurator, external, iframe]).toHaveLength(5);
    });
});
