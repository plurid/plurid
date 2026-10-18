// #region imports
import React, { useEffect, useRef } from 'react';
import { createStoreHook } from 'react-redux';
import { CameraDelta, PLURID_ATTRIBUTE_PLANE_ANCHOR } from '@plurid/plurid-data';

import StateContext from '~services/state/context';
import { AppState } from '~services/state/store';
import actions from '~services/state/actions';
import selectors from '~services/state/selectors';
import { planeElementOf, overlayOf, isScrollableAlong } from '~services/logic/input/guard';
import { createWheelHistory, normalizeWheel, wheelToDelta } from '~services/logic/input/wheel';
import { createPlaneWheelOwnership } from '~services/logic/input/wheelOwnership';
// #endregion imports

// #region module
const useEngineStore = createStoreHook(StateContext as any);

interface ClickToScrollOptions {
    viewElement: React.RefObject<HTMLDivElement>;
    onCameraDelta: (delta: CameraDelta) => void;
    onReset: () => void;
    onActivate: () => void;
}

const enabled = (state: AppState) =>
    state.configuration.space.gestures?.wheel === 'click-to-scroll' &&
    state.configuration.space.gestures?.buttonMap?.wheel !== 'disabled';

/**
 * Capture decides ownership BEFORE image zoom, OrbitControls, terminal and native scroll handlers.
 * Content receives its original event; a bubble fallback contains an otherwise unhandled wheel.
 * This state belongs to the application UI, never the arrangement or hover-derived active plane.
 */
export const useClickToScroll = (options: ClickToScrollOptions) => {
    const store = useEngineStore();
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        const view = options.viewElement.current;
        if (!view) {
            return;
        }
        const current = () => store.getState() as AppState;
        const ownership = createPlaneWheelOwnership();
        const getPlane = selectors.space.makeGetTreePlaneByID();
        let history = createWheelHistory();
        const contentEvents = new WeakSet<WheelEvent>();
        let stateKey = '';
        let previousDockID = '';

        const reset = () => {
            ownership.reset();
            history = createWheelHistory();
            optionsRef.current.onReset();
        };
        const activate = (planeID: string) => {
            // Even re-clicking the same plane ends a pending camera gesture and starts fresh.
            reset();
            optionsRef.current.onActivate();
            store.dispatch(actions.ui.setScrollPlaneID(planeID));
        };
        const synchronize = () => {
            let state = current();
            const dockID = enabled(state) ? selectors.space.getDockedPlaneID(state) : '';
            const justDocked = !!dockID && dockID !== previousDockID;
            previousDockID = dockID;
            if (justDocked && state.ui.scrollPlaneID !== dockID) {
                // A programmatic dock is explicit activation too. Keep it after reveal rather
                // than reviving the previously clicked plane's scroll ownership.
                store.dispatch(actions.ui.setScrollPlaneID(dockID));
                state = current();
            }
            const space = state.configuration.space;
            const key = [
                enabled(state),
                state.ui.scrollPlaneID,
                selectors.space.getDockedPlaneID(state),
                space.transformMode,
                space.firstPerson,
                state.ui.grabMode,
                state.ui.grabHold,
            ].join('|');
            if (key !== stateKey) {
                stateKey = key;
                reset();
            }
            if (
                state.ui.scrollPlaneID &&
                (!enabled(state) ||
                    !getPlane(state, state.ui.scrollPlaneID) ||
                    getPlane(state, state.ui.scrollPlaneID)?.show === false)
            ) {
                store.dispatch(actions.ui.setScrollPlaneID(''));
            }
        };
        synchronize();
        const unsubscribe = store.subscribe(synchronize);

        // Nested applications and portalled dialogs own their own input. Quick Preview, for
        // example, is outside this View, so none of these listeners route its wheel or Escape.
        const inScope = (target: EventTarget | null) =>
            target instanceof Element &&
            target.closest('[data-plurid-entity="PluridView"]') === view &&
            !overlayOf(target);
        const onPointerDown = (event: PointerEvent) => {
            if (
                !enabled(current()) ||
                !inScope(event.target) ||
                event.button !== 0 ||
                event.isPrimary === false
            ) {
                return;
            }
            const planeID = planeElementOf(event.target)?.getAttribute('data-plurid-plane') || '';
            const state = current();
            const space = state.configuration.space;
            if (
                planeID &&
                (event.shiftKey ||
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey ||
                    state.ui.grabMode ||
                    state.ui.grabHold ||
                    space.firstPerson ||
                    space.transformMode !== 'ALL')
            ) {
                return;
            }
            activate(planeID);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (!enabled(current()) || !inScope(event.target)) {
                return;
            }
            if (event.key === 'Escape' || event.code === 'Escape') {
                // Document capture runs before a host file handler can stop Escape. Clearing this
                // independent state must not swallow that handler's own selection/menu behavior.
                activate('');
            } else if (
                (event.key === 'Enter' || event.code === 'Enter') &&
                !event.shiftKey &&
                !event.altKey &&
                !event.ctrlKey &&
                !event.metaKey &&
                (event.target as Element).hasAttribute(PLURID_ATTRIBUTE_PLANE_ANCHOR)
            ) {
                activate(
                    (event.target as Element).getAttribute(PLURID_ATTRIBUTE_PLANE_ANCHOR) || '',
                );
            }
        };
        const consume = (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };
        const onWheelCapture = (event: WheelEvent) => {
            const state = current();
            if (!enabled(state) || !inScope(event.target)) {
                return;
            }
            const space = state.configuration.space;
            const gestures = space.gestures || {};
            const wheel = normalizeWheel(event, state.space.viewSize.height, history);
            const pinch = wheel.pinch && wheel.source === 'trackpad';
            if (!pinch && (event.ctrlKey || event.metaKey)) {
                // Preserve browser zoom rather than converting a modified mouse notch to navigation.
                reset();
                return;
            }
            const grab = state.ui.grabMode || state.ui.grabHold;
            const navigation =
                pinch ||
                event.shiftKey ||
                event.altKey ||
                grab ||
                space.firstPerson ||
                space.transformMode !== 'ALL'
                    ? [
                          pinch,
                          event.shiftKey,
                          event.altKey,
                          grab,
                          space.firstPerson,
                          space.transformMode,
                      ].join('|')
                    : '';
            const planeID = planeElementOf(event.target)?.getAttribute('data-plurid-plane') || '';
            const owner = ownership.resolve({
                planeID,
                selectedPlaneID: selectors.space.getDockedPlaneID(state) || state.ui.scrollPlaneID,
                navigation,
            });
            if (owner === 'content') {
                contentEvents.add(event);
                return;
            }
            consume(event);
            if (owner === 'consume') {
                return;
            }
            const rect = view.getBoundingClientRect();
            const resolution = wheelToDelta(wheel, {
                transformMode: space.transformMode as any,
                grabMode: grab,
                firstPerson: space.firstPerson,
                onPlane: false,
                scrollable: false,
                shift: event.shiftKey,
                alt: event.altKey,
                ctrlOrMeta: event.ctrlKey || event.metaKey,
                locks: space.transformLocks,
                policy: 'click-to-scroll',
                trackpadScroll: gestures.trackpadScroll,
                wheelZoomStep: gestures.wheelZoomStep,
                trackpadPinchSensitivity: gestures.trackpadPinchSensitivity,
                rotateSensitivity: gestures.rotateSensitivity,
                anchor: { x: event.clientX - rect.left, y: event.clientY - rect.top },
            });
            // Locked axes and zero deltas remain camera-owned: they never leak to a preview.
            if (resolution.kind === 'camera') {
                optionsRef.current.onCameraDelta(resolution.delta);
            }
        };
        const onWheelBubble = (event: WheelEvent) => {
            if (!contentEvents.has(event)) {
                return;
            }
            event.stopPropagation();
            const plane = planeElementOf(event.target);
            if (
                !isScrollableAlong(event.target, 'y', event.deltaY, plane) &&
                !isScrollableAlong(event.target, 'x', event.deltaX, plane)
            ) {
                event.preventDefault();
            }
        };

        view.addEventListener('pointerdown', onPointerDown, true);
        view.ownerDocument.addEventListener('keydown', onKeyDown, true);
        view.addEventListener('wheel', onWheelCapture, { capture: true, passive: false });
        view.addEventListener('wheel', onWheelBubble, { passive: false });
        return () => {
            unsubscribe();
            view.removeEventListener('pointerdown', onPointerDown, true);
            view.ownerDocument.removeEventListener('keydown', onKeyDown, true);
            view.removeEventListener('wheel', onWheelCapture, true);
            view.removeEventListener('wheel', onWheelBubble);
            store.dispatch(actions.ui.setScrollPlaneID(''));
            reset();
        };
    }, [store, options.viewElement]);
};
// #endregion module
