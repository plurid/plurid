// #region imports
    // #region libraries
    import React, {
        useRef,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        PluridConfigurationSpaceShortcuts,
        PluridStateUI,
        PLURID_ATTRIBUTE_ENTITY,
        PLURID_ENTITY_PLANE_CONTENT,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';

    import {
        isEditableTarget,
    } from '~services/logic/input/guard';

    import {
        resolveShortcutCode,
        isShortcutDisabled,
    } from '~services/logic/shortcuts/registry';
    // #endregion external
// #endregion imports



// #region module
export interface UseGrabModeParameters {
    viewElement: React.RefObject<HTMLDivElement>;
    stateUI: PluridStateUI;
    shortcuts?: PluridConfigurationSpaceShortcuts;
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    /** The camera is docked on a page (the page presentation): Space inside its content scrolls it. */
    dockedRef: React.MutableRefObject<boolean>;
}


/**
 * Grab / navigate mode. Two ways in: **G** arms it (a registry shortcut, handled by the keydown
 * dispatcher; ONE drag — the release ends it, `usePointerGestures`' `finish` — G again or Escape
 * cancels an armed grab that was never used), **Space** holds it (tracked here: down → on, up /
 * window blur → off, as many drags as the hold lasts). When ON a left drag orbits everywhere — over
 * plane content too — and the wheel always zooms; when OFF the space behaves like a page over planes
 * and orbits only on empty space. Both flags live in the `ui` slice
 * so every listener (pointer, wheel, cursor) reads one source of truth.
 *
 * `grabModeRef` mirrors the effective value on every render for the pointer/wheel handlers.
 */
/** The View carries the presentation for its stylesheets; the hold reads it there (no store round trip). */
const isPagePresentation = (
    element: HTMLElement,
): boolean => element.getAttribute('data-plurid-presentation') === 'page';

export const useGrabMode = (
    {
        viewElement,
        stateUI,
        shortcuts,
        dispatch,
        dockedRef,
    }: UseGrabModeParameters,
) => {
    const grabMode = stateUI.grabMode || stateUI.grabHold;
    const grabModeRef = useRef(grabMode);
    grabModeRef.current = grabMode;

    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    useEffect(() => {
        const element = viewElement.current;
        if (!element || typeof window === 'undefined') {
            return;
        }

        const holdCode = () => (isShortcutDisabled('grabHold', shortcutsRef.current)
            ? undefined
            : resolveShortcutCode('grabHold', shortcutsRef.current));

        const onKeyDown = (event: KeyboardEvent) => {
            const code = holdCode();
            if (!code || event.code !== code) {
                return;
            }
            if (isEditableTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }
            // Inside plane content Space is the page's while the camera is DOCKED on it (it scrolls
            // the page); once the space is revealed a page is a sheet in the space and its focused
            // scroller must not swallow the hold (the page's scroller keeps the focus across the
            // reveal, 2026-09-06). In the space presentation content keeps Space too.
            if (
                (dockedRef.current || !isPagePresentation(element))
                && (event.target as Element | null)?.closest?.(`[${PLURID_ATTRIBUTE_ENTITY}="${PLURID_ENTITY_PLANE_CONTENT}"]`)
            ) {
                return;
            }
            // Space would scroll the page / activate a focused button; the hold is a navigation gesture.
            event.preventDefault();
            if (!event.repeat) {
                dispatch(actions.ui.setUIGrabHold(true));
            }
        };

        const release = () => {
            dispatch(actions.ui.setUIGrabHold(false));
        };

        const onKeyUp = (event: KeyboardEvent) => {
            const code = holdCode();
            if (code && event.code === code) {
                release();
            }
        };

        element.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', release);

        return () => {
            element.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', release);
        };
    }, []);

    return {
        grabMode,
        grabModeRef,
    };
}
// #endregion module



// #region exports
export default useGrabMode;
// #endregion exports
