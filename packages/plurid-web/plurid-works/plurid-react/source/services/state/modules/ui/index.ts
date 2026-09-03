// #region imports
    // #region libraries
    import {
        createSlice,
        PayloadAction,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region internal
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion internal
// #endregion imports



// #region module
export interface MarqueeRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface UIState {
    toolbarScrollPosition: number;
    /** Grab / navigate mode toggled with G: a left drag orbits everywhere, the wheel zooms. */
    grabMode: boolean;
    /** Grab mode while Space is held. */
    grabHold: boolean;
    /** The keyboard-shortcuts help overlay. */
    shortcutsOverlayVisible: boolean;
    /** The rubber-band selection rectangle in view px while a ⌘/Ctrl-drag on empty space is in progress. */
    marquee: MarqueeRect | null;
}


const initialState: UIState = {
    toolbarScrollPosition: 0,
    grabMode: false,
    grabHold: false,
    shortcutsOverlayVisible: false,
    marquee: null,
};


export const ui = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setMarquee: (
            state,
            action: PayloadAction<MarqueeRect | null>,
        ) => {
            state.marquee = action.payload;
        },
        setUIToolbarScrollPosition: (
            state,
            action: PayloadAction<number>,
        ) => {
            state.toolbarScrollPosition = action.payload;
        },
        setUIGrabMode: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.grabMode = action.payload;
        },
        toggleUIGrabMode: (
            state,
        ) => {
            state.grabMode = !state.grabMode;
        },
        setUIGrabHold: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            if (state.grabHold !== action.payload) {
                state.grabHold = action.payload;
            }
        },
        setShortcutsOverlayVisible: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.shortcutsOverlayVisible = action.payload;
        },
        toggleShortcutsOverlay: (
            state,
        ) => {
            state.shortcutsOverlayVisible = !state.shortcutsOverlayVisible;
        },
    },
});
// #endregion module



// #region exports
export const actions = ui.actions;


export const getToolbarScrollPosition = (state: AppState) => state.ui.toolbarScrollPosition;
/** Effective grab mode: toggled with G or held with Space. */
export const getGrabMode = (state: AppState) => state.ui.grabMode || state.ui.grabHold;
export const getGrabToggled = (state: AppState) => state.ui.grabMode;
export const getShortcutsOverlayVisible = (state: AppState) => state.ui.shortcutsOverlayVisible;

export const selectors = {
    getToolbarScrollPosition,
    getGrabMode,
    getGrabToggled,
    getShortcutsOverlayVisible,
};


export const reducer = ui.reducer;
// #endregion exports
