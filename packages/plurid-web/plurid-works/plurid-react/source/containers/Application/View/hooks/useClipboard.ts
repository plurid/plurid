// #region imports
    // #region libraries
    import React, {
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';

    import {
        isEditableTarget,
    } from '~services/logic/input/guard';

    import {
        copySelection,
        pasteFragment,
        selectionFragmentText,
    } from '~services/state/thunks/selection';

    import {
        warnOnce,
    } from '~services/logic/development/warn';
    // #endregion external
// #endregion imports



// #region module
export interface UseClipboardParameters {
    viewElement: React.RefObject<HTMLDivElement>;
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    getState: () => AppState;
    /** `space.clipboard` — off drops the listeners entirely (the page keeps every ⌘C / ⌘V). */
    enabled: boolean;
    /** Whether a host's warnings are on (a paste that had to drop planes says so once). */
    warnings: boolean;
}


/**
 * COPY, CUT AND PASTE OF PLANES — on the browser's own clipboard events, not on a key binding.
 *
 * ⌘/Ctrl+C, X and V are the browser's: they fire `copy` / `cut` / `paste` carrying a `DataTransfer`,
 * which reads and writes the system clipboard with no permission and no prompt — the only way a web
 * page can read a clipboard at all. So the engine listens for the EVENTS: what it writes is an
 * arrangement fragment as text (`services/logic/arrangement/fragment`), which means a space can be
 * pasted into another tab, another window, a different site running plurid, or a text editor (where
 * it is legible JSON, and where a copy from an editor pastes back).
 *
 * THE PRESS IS THE PAGE'S FIRST. The engine takes a clipboard event only when the space owns it:
 * the view has the focus, the target is not something the reader types into, and — for a copy — the
 * reader has not selected text to copy instead. Nothing is selected, nothing is on the clipboard,
 * the text is not a fragment: the event is left alone, exactly as before.
 */
export const useClipboard = (
    parameters: UseClipboardParameters,
) => {
    const {
        viewElement,
        dispatch,
        getState,
        enabled,
        warnings,
    } = parameters;

    useEffect(() => {
        if (!enabled || typeof document === 'undefined') {
            return;
        }

        /** The space owns this event: the focus is inside the view and the target is not a field. */
        const mine = (
            event: ClipboardEvent,
        ): boolean => {
            const view = viewElement.current;
            if (!view || isEditableTarget(event.target)) {
                return false;
            }
            const active = document.activeElement;
            return !!active && (view === active || view.contains(active));
        };

        /** A reader selecting words to copy is copying WORDS, not planes. */
        const hasTextSelection = (): boolean => {
            const selection = typeof window !== 'undefined' ? window.getSelection() : null;
            return !!selection && !selection.isCollapsed && selection.toString().trim().length > 0;
        };

        const put = (
            event: ClipboardEvent,
            cut: boolean,
        ) => {
            if (!mine(event) || hasTextSelection()) {
                return;
            }
            const text = selectionFragmentText(getState());
            if (!text || !event.clipboardData) {
                return;
            }
            event.clipboardData.setData('text/plain', text);
            event.preventDefault();
            // the thunk writes the slot (and the async clipboard where it can) and, for a cut,
            // closes what it copied
            dispatch(copySelection({ cut }) as any);
        };

        const onCopy = (event: ClipboardEvent) => put(event, false);
        const onCut = (event: ClipboardEvent) => put(event, true);

        const onPaste = (event: ClipboardEvent) => {
            if (!mine(event)) {
                return;
            }
            const text = event.clipboardData?.getData('text/plain') ?? '';
            const before = getState().space.tree.length;
            dispatch(pasteFragment({
                text,
                onDropped: (routes) => {
                    warnOnce(
                        'paste-unregistered',
                        'a pasted arrangement named planes this application does not register, and they were dropped: '
                            + routes.join(', ')
                            + '. Register those routes to hold them.',
                        warnings,
                    );
                },
            }) as any);
            // only when something actually landed is the paste the space's
            if (getState().space.tree.length !== before) {
                event.preventDefault();
            }
        };

        document.addEventListener('copy', onCopy);
        document.addEventListener('cut', onCut);
        document.addEventListener('paste', onPaste);

        return () => {
            document.removeEventListener('copy', onCopy);
            document.removeEventListener('cut', onCut);
            document.removeEventListener('paste', onPaste);
        };
    }, [
        enabled,
        warnings,
        viewElement,
        dispatch,
        getState,
    ]);
};
// #endregion module
