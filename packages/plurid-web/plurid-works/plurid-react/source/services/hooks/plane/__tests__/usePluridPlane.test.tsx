/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';

    import {
        renderHook,
        act,
    } from '@testing-library/react';

    import {
        configureStore,
    } from '@reduxjs/toolkit';

    import {
        Provider,
    } from 'react-redux';
    // #endregion libraries


    // #region internal
    import StateContext from '../../../state/context';

    import {
        reducer as spaceReducer,
        actions as spaceActions,
    } from '../../../state/modules/space';

    import {
        usePluridPlane,
        PluridPlaneIDContext,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The plane lens only touches `state.space`, so a store with just the space
 * slice suffices - the same reducer the engine runs.
 */
const makeStore = () => configureStore({
    reducer: {
        space: spaceReducer,
    },
});

const wrapperFor = (
    store: ReturnType<typeof makeStore>,
    planeID?: string,
) => ({ children }: { children: React.ReactNode }) => (
    <Provider
        store={store}
        context={StateContext as any}
    >
        <PluridPlaneIDContext.Provider
            value={planeID}
        >
            {children}
        </PluridPlaneIDContext.Provider>
    </Provider>
);

describe('usePluridPlane', () => {
    it('returns inert values outside plane content (planeID undefined)', () => {
        const store = makeStore();
        const { result } = renderHook(
            () => usePluridPlane(),
            { wrapper: wrapperFor(store) },
        );

        expect(result.current.planeID).toBeUndefined();
        expect(result.current.active).toBe(false);
        expect(result.current.selected).toBe(false);
        expect(result.current.isolation).toBe('none');
        expect(result.current.shown).toBe(true);
        expect(result.current.location).toBeUndefined();
        expect(typeof result.current.scale).toBe('number');
        expect(result.current.viewSize.width).toBeGreaterThan(0);
    });

    it('active flips when the plane becomes the active plane', () => {
        const store = makeStore();
        const { result } = renderHook(
            () => usePluridPlane(),
            { wrapper: wrapperFor(store, 'p1') },
        );

        expect(result.current.planeID).toBe('p1');
        expect(result.current.active).toBe(false);

        act(() => {
            store.dispatch(spaceActions.setSpaceField({
                field: 'activePlaneID',
                value: 'p1',
            } as any));
        });
        expect(result.current.active).toBe(true);

        act(() => {
            store.dispatch(spaceActions.setSpaceField({
                field: 'activePlaneID',
                value: 'p2',
            } as any));
        });
        expect(result.current.active).toBe(false);
    });

    it('selected tracks the multi-selection working set', () => {
        const store = makeStore();
        const { result } = renderHook(
            () => usePluridPlane(),
            { wrapper: wrapperFor(store, 'p1') },
        );

        expect(result.current.selected).toBe(false);

        act(() => {
            store.dispatch(spaceActions.toggleSelection('p1'));
        });
        expect(result.current.selected).toBe(true);

        act(() => {
            store.dispatch(spaceActions.toggleSelection('p1'));
        });
        expect(result.current.selected).toBe(false);
    });

    it('isolation distinguishes self from other', () => {
        const store = makeStore();
        const { result } = renderHook(
            () => usePluridPlane(),
            { wrapper: wrapperFor(store, 'p1') },
        );

        expect(result.current.isolation).toBe('none');

        act(() => {
            store.dispatch(spaceActions.setSpaceField({
                field: 'isolatePlane',
                value: 'p1',
            } as any));
        });
        expect(result.current.isolation).toBe('self');

        act(() => {
            store.dispatch(spaceActions.setSpaceField({
                field: 'isolatePlane',
                value: 'p2',
            } as any));
        });
        expect(result.current.isolation).toBe('other');
    });

    it('shown + location resolve from the tree plane (structural sharing)', () => {
        const store = makeStore();
        const treePlane: any = {
            planeID: 'p1',
            sourceID: 'p1',
            show: true,
            location: {
                translateX: 10,
                translateY: 0,
                translateZ: 0,
                rotateX: 0,
                rotateY: 0,
            },
            children: [],
        };

        act(() => {
            store.dispatch(spaceActions.setTree([treePlane]));
        });

        const { result } = renderHook(
            () => usePluridPlane(),
            { wrapper: wrapperFor(store, 'p1') },
        );

        expect(result.current.shown).toBe(true);
        expect(result.current.location?.translateX).toBe(10);

        const firstLocation = result.current.location;

        // an unrelated dispatch keeps the SAME location reference
        act(() => {
            store.dispatch(spaceActions.setSpaceField({
                field: 'activePlaneID',
                value: 'p1',
            } as any));
        });
        expect(result.current.location).toBe(firstLocation);
    });
});
// #endregion module
