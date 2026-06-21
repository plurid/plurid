/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import { renderHook } from '@testing-library/react';

    import {
        PLURID_PUBSUB_TOPIC,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import useEngineEvents from '../useEngineEvents';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `useEngineEvents` is the engine→host OBSERVE channel (Tier 1): one effect per watched slice
 * publishes `space.changed` `{ kind, value }` when that slice's reference changes. These tests render
 * the hook and flip slices to pin that exactly the right `kind` fires (and only when it changes) —
 * the unit-level counterpart to the harness `space.changed` verification.
 */
const baseSpace = () => ({
    selectedPlaneIDs: [] as string[],
    tree: [] as any[],
    links: [] as any[],
    activePlaneID: '',
    isolatePlane: '',
    resolvedLayout: false,
    loading: false,
});

describe('useEngineEvents', () => {
    it('publishes every watched slice once on mount', () => {
        const publish = jest.fn();
        const pubsub: any = { publish };
        const state: any = { space: baseSpace() };

        renderHook(() => useEngineEvents({ pubsub, state }));

        // selection / tree / links / activePlane / isolate / layoutResolved / loading
        const kinds = publish.mock.calls.map((c) => c[0].data.kind).sort();
        expect(kinds).toEqual(
            ['activePlane', 'isolate', 'layoutResolved', 'links', 'loading', 'selection', 'tree'],
        );
        // every call rides the single CHANGED topic
        expect(publish.mock.calls.every((c) => c[0].topic === PLURID_PUBSUB_TOPIC.CHANGED)).toBe(true);
    });

    it('re-publishes ONLY the slice whose reference changed', () => {
        const publish = jest.fn();
        const pubsub: any = { publish };
        const space = baseSpace();
        const initial: any = { space };

        const { rerender } = renderHook(
            ({ state }) => useEngineEvents({ pubsub, state }),
            { initialProps: { state: initial } },
        );

        publish.mockClear(); // drop the mount burst

        // New selection reference; all OTHER slice references are preserved via the spread.
        const next: any = { space: { ...space, selectedPlaneIDs: ['/a', '/b'] } };
        rerender({ state: next });

        expect(publish).toHaveBeenCalledTimes(1);
        expect(publish).toHaveBeenCalledWith({
            topic: PLURID_PUBSUB_TOPIC.CHANGED,
            data: { kind: 'selection', value: ['/a', '/b'] },
        });
    });

    it('reports a tree change with kind:"tree"', () => {
        const publish = jest.fn();
        const pubsub: any = { publish };
        const space = baseSpace();
        const initial: any = { space };

        const { rerender } = renderHook(
            ({ state }) => useEngineEvents({ pubsub, state }),
            { initialProps: { state: initial } },
        );
        publish.mockClear();

        const newTree = [{ planeID: '/a', show: true }];
        rerender({ state: { space: { ...space, tree: newTree } } });

        expect(publish).toHaveBeenCalledTimes(1);
        expect(publish).toHaveBeenCalledWith({
            topic: PLURID_PUBSUB_TOPIC.CHANGED,
            data: { kind: 'tree', value: newTree },
        });
    });

    it('does nothing when no watched slice reference changes', () => {
        const publish = jest.fn();
        const pubsub: any = { publish };
        const space = baseSpace();
        const initial: any = { space };

        const { rerender } = renderHook(
            ({ state }) => useEngineEvents({ pubsub, state }),
            { initialProps: { state: initial } },
        );
        publish.mockClear();

        // A new state object, but the SAME space (so every slice reference is unchanged).
        rerender({ state: { space } });

        expect(publish).not.toHaveBeenCalled();
    });
});
// #endregion module
