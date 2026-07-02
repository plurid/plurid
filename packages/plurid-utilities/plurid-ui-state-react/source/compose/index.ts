// #region imports
    // #region internal
    import * as head from '../modules/head';
    import * as notifications from '../modules/notifications';
    import * as shortcuts from '../modules/shortcuts';
    import * as sitting from '../modules/sitting';
    import * as themes from '../modules/themes';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridUIState {
    head: head.HeadState;
    notifications: notifications.NotificationsState;
    shortcuts: shortcuts.ShortcutsState;
    sitting: sitting.SittingState;
    themes: themes.ThemesState;
}


export interface PluridUIStateOverrides {
    head?: Partial<head.HeadState>;
    /**
     * Array slice: a provided value REPLACES the initial notifications.
     */
    notifications?: notifications.NotificationsState;
    shortcuts?: Partial<shortcuts.ShortcutsState>;
    sitting?: Partial<sitting.SittingState>;
    themes?: Partial<themes.ThemesState>;
}


/**
 * The five UI slices, pre-wired for a host store. Replaces the per-application
 * hand-rolled state modules:
 *
 *      const ui = composePluridUIState({
 *          head: { title: 'denote - plurid' },
 *      });
 *
 *      const store = configureStore({
 *          reducer: {
 *              ...ui.reducers,
 *              // ...application slices
 *          },
 *      });
 *
 * Overrides are PARTIAL initial states, spread over each module's defaults
 * (the plain `factory(state)` requires the full state shape).
 *
 * `actions`/`selectors` come from the module defaults: RTK action types are
 * name-derived strings ('head/setHead', ...), identical across factory
 * instances, so the default actions drive the override reducers.
 */
export const composePluridUIState = (
    overrides?: PluridUIStateOverrides,
) => {
    const initialStates: PluridUIState = {
        head: {
            ...head.initialState,
            ...overrides?.head,
        },
        notifications: overrides?.notifications ?? notifications.initialState,
        shortcuts: {
            ...shortcuts.initialState,
            ...overrides?.shortcuts,
        },
        sitting: {
            ...sitting.initialState,
            ...overrides?.sitting,
        },
        themes: {
            ...themes.initialState,
            ...overrides?.themes,
        },
    };

    return {
        reducers: {
            head: head.factory(initialStates.head).reducer,
            notifications: notifications.factory(initialStates.notifications).reducer,
            shortcuts: shortcuts.factory(initialStates.shortcuts).reducer,
            sitting: sitting.factory(initialStates.sitting).reducer,
            themes: themes.factory(initialStates.themes).reducer,
        },
        actions: {
            head: head.actions,
            notifications: notifications.actions,
            shortcuts: shortcuts.actions,
            sitting: sitting.actions,
            themes: themes.actions,
        },
        selectors: {
            head: head.selectors,
            notifications: notifications.selectors,
            shortcuts: shortcuts.selectors,
            sitting: sitting.selectors,
            themes: themes.selectors,
        },
        initialStates,
    };
};
// #endregion module
