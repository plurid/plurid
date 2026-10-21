// #region imports
    // #region libraries
    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import type {
        LookName,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';
    import {
        state as stateEngine,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
type Dispatch = ThunkDispatch<{}, {}, AnyAction>;
type GetState = () => AppState;
export type LookThunk = (dispatch: Dispatch, getState: GetState) => void;


/** The themes plane content reads, resolved from the configuration as the store and the bus do. */
const resolveThemes = (
    dispatch: Dispatch,
    getState: GetState,
) => {
    const resolved = stateEngine.resolveThemes(getState().configuration, undefined);
    dispatch(actions.themes.setGeneralTheme(resolved.general));
    dispatch(actions.themes.setInteractionTheme(resolved.interaction));
};


/**
 * A part of `global.theme` picked (the Global drawer): `look` follows the look, a name sets its
 * theme. It was looked up by name (`themes[name]`), so `look` would have set none (2026-10-21).
 */
export const pickTheme = (
    part: 'general' | 'interaction',
    name: string,
): LookThunk => (dispatch, getState) => {
    dispatch(part === 'general'
        ? actions.configuration.setConfigurationThemeGeneral(name)
        : actions.configuration.setConfigurationThemeInteraction(name));
    resolveThemes(dispatch, getState);
};


/** The look picked (the Global drawer): `global.look`, and the themes that follow it. */
export const pickLook = (
    look: LookName,
): LookThunk => (dispatch, getState) => {
    dispatch(actions.configuration.setConfigurationLook(look));
    resolveThemes(dispatch, getState);
};
// #endregion module
