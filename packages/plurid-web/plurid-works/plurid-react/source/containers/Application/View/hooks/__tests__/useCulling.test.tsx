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
});
