// #region imports
    // #region libraries
    import {
        configureStore,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region internal
    import {
        composePluridUIState,
    } from '../compose';

    import * as head from '../modules/head';
    import * as notifications from '../modules/notifications';
    import * as shortcuts from '../modules/shortcuts';
    import * as sitting from '../modules/sitting';
    import * as themes from '../modules/themes';
    // #endregion internal
// #endregion imports



// #region module
describe('composePluridUIState', () => {
    it('defaults match every module initialState', () => {
        const ui = composePluridUIState();
        const store = configureStore({
            reducer: ui.reducers,
        });

        const state = store.getState();
        expect(state.head).toEqual(head.initialState);
        expect(state.notifications).toEqual(notifications.initialState);
        expect(state.shortcuts).toEqual(shortcuts.initialState);
        expect(state.sitting).toEqual(sitting.initialState);
        expect(state.themes).toEqual(themes.initialState);
    });

    it('partial overrides spread over defaults', () => {
        const ui = composePluridUIState({
            head: {
                title: 'x - plurid',
            },
            sitting: {
                tray: true,
            },
        });
        const store = configureStore({
            reducer: ui.reducers,
        });

        const state = store.getState();
        expect(state.head.title).toBe('x - plurid');
        expect(state.head.description).toBe(head.initialState.description);
        expect(ui.selectors.sitting.getTray(state)).toBe(true);
        expect(state.sitting.currentLink).toBe(sitting.initialState.currentLink);
    });

    it('default actions drive override-factory reducers (type-string compatibility)', () => {
        const ui = composePluridUIState({
            head: {
                title: 'initial',
            },
        });
        const store = configureStore({
            reducer: ui.reducers,
        });

        store.dispatch(ui.actions.head.setHead({
            description: 'described',
        }));
        store.dispatch(ui.actions.sitting.toggleSittingTray());

        const state = store.getState();
        expect(state.head.title).toBe('initial');
        expect(state.head.description).toBe('described');
        expect(state.sitting.tray).toBe(!sitting.initialState.tray);
    });

    it('notifications: full-replace override + add action', () => {
        const ui = composePluridUIState({
            notifications: [],
        });
        const store = configureStore({
            reducer: ui.reducers,
        });

        store.dispatch(ui.actions.notifications.add({
            id: 'n1',
            text: 'hello',
            timeout: 1000,
        } as any));

        const state = store.getState();
        expect(state.notifications.length).toBe(1);
        expect((state.notifications[0] as any).text).toBe('hello');
    });
});
// #endregion module
