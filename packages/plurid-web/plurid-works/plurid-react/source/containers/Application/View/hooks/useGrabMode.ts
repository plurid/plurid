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
}


/**
 * Grab / navigate mode. Two ways in: **G** toggles it (a registry shortcut, handled by the keydown
 * dispatcher), **Space** holds it (tracked here: down → on, up / window blur → off). When ON a left
 * drag orbits everywhere — over plane content too — and the wheel always zooms; when OFF the space
 * behaves like a page over planes and orbits only on empty space. Both flags live in the `ui` slice
 * so every listener (pointer, wheel, cursor) reads one source of truth.
 *
 * `grabModeRef` mirrors the effective value on every render for the pointer/wheel handlers.
 */
export const useGrabMode = (
    {
        viewElement,
        stateUI,
        shortcuts,
        dispatch,
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
            // Inside plane content Space is the page's (it scrolls a docked page); the hold starts
            // from the view or a plane's anchor.
            if ((event.target as Element | null)?.closest?.(`[${PLURID_ATTRIBUTE_ENTITY}="${PLURID_ENTITY_PLANE_CONTENT}"]`)) {
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
