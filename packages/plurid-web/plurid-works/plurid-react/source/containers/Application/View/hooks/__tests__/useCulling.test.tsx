/**
 * @jest-environment jsdom
 */
/**
 * The culling pass re-runs when a plane's ELIGIBILITY changes with a still camera (C05, 2026-09-06):
 * a far plane is culled; selecting it (an exception) un-culls it without any camera movement.
 */
import React, { act, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

import actions from '~services/state/actions';
import useCulling from '../useCulling';
import {
    makeSpaceStore,
    configurationWith,
    treePlane,
    HeadlessStore,
} from '../../../../../testing';



const Probe: React.FC<{ store: HeadlessStore; eligibility: string }> = ({ store, eligibility }) => {
    const viewElement = useRef<HTMLDivElement>(null);
    const state = store.getState();
    useCulling({
        dispatch: store.dispatch as any,
        stateRef: { get current() { return store.getState(); } } as any,
        transform: state.space.transform,
        tree: state.space.tree,
        viewElement,
        eligibility,
    });
    return <div ref={viewElement} />;
};


describe('useCulling', () => {
    beforeEach(() => {
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    it('a selected plane stops being culled with a still camera', async () => {
        const store = makeSpaceStore(
            configurationWith({ space: { culling: { enabled: true, distance: 1000 } } }),
            [treePlane('near'), treePlane('far', { location: { translateX: 0, translateY: 0, translateZ: -50000, rotateX: 0, rotateY: 0 } })],
        );
        const container = document.createElement('div');
        document.body.appendChild(container);
        let root: Root | undefined;
        await act(async () => {
            root = createRoot(container);
            root.render(<Probe store={store} eligibility="none" />);
        });
        await act(async () => { jest.advanceTimersByTime(150); });
        expect(store.getState().space.culled.hidden).toContain('far');

        await act(async () => {
            store.dispatch(actions.space.setSelection(['far']));
            root!.render(<Probe store={store} eligibility="selected:far" />);
        });
        await act(async () => { jest.advanceTimersByTime(150); });
        expect(store.getState().space.culled.hidden).not.toContain('far');

        await act(async () => { root!.unmount(); });
        container.remove();
    });

    it('the detach tier: a hidden plane is detached after the delay by the maturity timer (no camera move), re-attached when shown, never while the camera moves, never the selected one', async () => {
        const far = { location: { translateX: 0, translateY: 0, translateZ: -50000, rotateX: 0, rotateY: 0 } };
        const store = makeSpaceStore(
            configurationWith({ space: { culling: { enabled: true, distance: 3000, detach: { mode: 'unmount', delay: 500 } } } }),
            [treePlane('near'), treePlane('far', far), treePlane('other', far)],
        );
        const container = document.createElement('div');
        document.body.appendChild(container);
        let root: Root | undefined;
        await act(async () => {
            root = createRoot(container);
            root.render(<Probe store={store} eligibility="none" />);
        });
        await act(async () => { jest.advanceTimersByTime(150); });
        expect(store.getState().space.culled.hidden).toEqual(['far', 'other']);
        expect(store.getState().space.culled.detached).toEqual([]);
        // the maturity timer: no camera move, the pass re-runs when the delay is up
        await act(async () => { jest.advanceTimersByTime(700); });
        expect(store.getState().space.culled.detached).toEqual(['far', 'other']);

        // the selected plane re-attaches at once (an exception)
        await act(async () => {
            store.dispatch(actions.space.setSelection(['other']));
            root!.render(<Probe store={store} eligibility="selected:other" />);
        });
        await act(async () => { jest.advanceTimersByTime(150); });
        expect(store.getState().space.culled.detached).toEqual(['far']);
        expect(store.getState().space.culled.hidden).toEqual(['far']);

        // the camera moves: nothing NEW is detached while it moves, the detached stay
        await act(async () => {
            store.dispatch(actions.space.setSelection([]));
            store.dispatch(actions.space.setMotion('gesture'));
            root!.render(<Probe store={store} eligibility="none|gesture" />);
        });
        await act(async () => { jest.advanceTimersByTime(900); });
        expect(store.getState().space.culled.hidden).toEqual(['far', 'other']);
        expect(store.getState().space.culled.detached).toEqual(['far']);
        await act(async () => {
            store.dispatch(actions.space.setMotion('idle'));
            root!.render(<Probe store={store} eligibility="none|idle" />);
        });
        await act(async () => { jest.advanceTimersByTime(900); });
        expect(store.getState().space.culled.detached).toEqual(['far', 'other']);

        await act(async () => { root!.unmount(); });
        container.remove();
    });

    it('the budget: the farthest hidden planes beyond max are detached at once', async () => {
        const at = (z: number) => ({ location: { translateX: 0, translateY: 0, translateZ: z, rotateX: 0, rotateY: 0 } });
        const store = makeSpaceStore(
            configurationWith({ space: { culling: { enabled: true, distance: 3000, detach: { mode: 'retain', delay: 100000, max: 1 } } } }),
            [treePlane('near'), treePlane('a', at(-20000)), treePlane('b', at(-30000)), treePlane('c', at(-40000))],
        );
        const container = document.createElement('div');
        document.body.appendChild(container);
        let root: Root | undefined;
        await act(async () => {
            root = createRoot(container);
            root.render(<Probe store={store} eligibility="none" />);
        });
        await act(async () => { jest.advanceTimersByTime(150); });
        expect(store.getState().space.culled.hidden).toEqual(['a', 'b', 'c']);
        // one hidden plane may stay mounted: the nearest
        expect(store.getState().space.culled.detached).toEqual(['b', 'c']);
        await act(async () => { root!.unmount(); });
        container.remove();
    });
});
