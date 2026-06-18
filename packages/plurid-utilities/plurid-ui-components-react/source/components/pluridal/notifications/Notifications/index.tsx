// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        DispatchAction,
        StateOfAny,
        themes as themesStateService,
        notifications as notificationsStateService,
        Notification as INotification,
    } from '@plurid/plurid-ui-state-react';
    // #endregion libraries


    // #region external
    import Notification from '../Notification';
    // #endregion external


    // #region internal
    import {
        StyledNotifications,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export type NotificationsState = StateOfAny & {
    themes: themesStateService.ThemesState;
    notifications: notificationsStateService.NotificationsState;
}

export type NotificationsSelectors = StateOfAny & {
    themes: typeof themesStateService.selectors;
    notifications: typeof notificationsStateService.selectors;
}


export interface NotificationsOwnProperties {
    selectors: NotificationsSelectors;
    context: React.Context<any>;
    elements?: Record<string, JSX.Element>;
}

export interface NotificationsStateProperties {
    stateGeneralTheme: Theme;
    stateNotifications: INotification[];
}

export interface NotificationsDispatchProperties {
    dispatchRemoveNotification: DispatchAction<typeof notificationsStateService.actions.remove>;
}

export type NotificationsProperties =
    & NotificationsOwnProperties
    & NotificationsStateProperties
    & NotificationsDispatchProperties;


const Notifications: React.FC<NotificationsProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region optional
            // #region values
            elements,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional

        // #region state
        stateGeneralTheme,
        stateNotifications,
        // #endregion state

        // #region dispatch
        dispatchRemoveNotification,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledNotifications>
            {stateNotifications.map(notification => {
                return (
                    <Notification
                        // #region required
                            // #region values
                            key={notification.id}
                            data={notification}
                            theme={stateGeneralTheme}
                            // #endregion values

                            // #region methods
                            remove={dispatchRemoveNotification}
                            // #endregion methods
                        // #endregion required

                        // #region optional
                            // #region values
                            elements={elements}
                            // #endregion values

                            // #region methods
                            // #endregion methods
                        // #endregion optional
                    />
                );
            })}
        </StyledNotifications>
    );
    // #endregion render
}


const mapStateToProperties =(
    state: NotificationsState,
    ownProperties: NotificationsOwnProperties,
): NotificationsStateProperties => ({
    stateGeneralTheme: ownProperties.selectors.themes.getGeneralTheme(state),
    stateNotifications: ownProperties.selectors.notifications.getAll(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): NotificationsDispatchProperties => ({
    dispatchRemoveNotification: (payload) => dispatch(
        notificationsStateService.actions.remove(payload),
    ),
});


const ConnectedNotifications = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Notifications);
// #endregion module



// #region exports
export default ConnectedNotifications;
// #endregion exports
