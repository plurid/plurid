// #region imports
    // #region libraries
    import {
        createSlice,
        PayloadAction,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import {
        Notification,
        AddNotificationPayload,
        StateWithSlice,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export type NotificationsState = Notification[];


export const initialState: NotificationsState = [];

export const name = 'notifications' as const;


export const factory = (
    state: NotificationsState = initialState,
) => createSlice({
    name,
    initialState: state,
    reducers: {
        new: (
            state,
            action: PayloadAction<string>,
        ) => {
            const id = Math.random() + '';
            const text = action.payload;

            const newNotification: Notification = {
                id,
                text,
            };

            return [
                ...state,
                newNotification,
            ];
        },
        add: (
            state,
            action: PayloadAction<AddNotificationPayload>,
        ) => {
            const id = action.payload.id || Math.random() + '';

            const newNotification: Notification = {
                ...action.payload,
                id,
            };

            const existingNotification = state.find(
                notification => notification.id === newNotification.id,
            );

            if (existingNotification) {
                const newState = state.map(notification => {
                    if (notification.id === newNotification.id) {
                        return newNotification;
                    }

                    return notification;
                });

                return newState;
            }

            return [
                ...state,
                newNotification,
            ];
        },
        update: (
            state,
            action: PayloadAction<Notification>,
        ) => {
            const newState = state.map(message => {
                if (message.id === action.payload.id) {
                    const newNotification: Notification = {
                        ...action.payload,
                    };
                    return newNotification;
                }

                return {
                    ...message,
                };
            });

            return newState;
        },
        remove: (
            state,
            action: PayloadAction<string>,
        ) => {
            const newState = state.filter(
                message => message.id !== action.payload,
            );

            return newState;
        },
    },
});

export const slice = factory();
// #endregion module



// #region exports
export const actions = slice.actions;


const getAll = (
    state: StateWithSlice<typeof name, NotificationsState>,
) => state.notifications;

export const selectors = {
    getAll,
};


export const reducer = slice.reducer;
// #endregion exports
