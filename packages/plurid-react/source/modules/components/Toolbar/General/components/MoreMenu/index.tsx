import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    PluridHeading,
    PluridSwitch,
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenu,
    StyledMoreMenuItem,
} from './styled';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



interface MoreMenuOwnProperties {
}

interface MoreMenuStateProperties {
    theme: Theme;
    configuration: PluridConfiguration;
}

interface MoreMenuDispatchProperties {
    dispatchToggleUIToolbarHideAction: typeof actions.configuration.toggleUIToolbarHideAction;
    dispatchToggleUIToolbarAlwaysShowIconsAction: typeof actions.configuration.toggleUIToolbarAlwaysShowIconsAction;
    dispatchToggleUIToolbarAlwaysTransformButtonsAction: typeof actions.configuration.toggleUIToolbarAlwaysTransformButtonsAction;
}

type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;

const MoreMenu: React.FC<MoreMenuProperties> = (properties) => {
    const {
        /** state */
        theme,
        configuration,

        /** dispatch */
        dispatchToggleUIToolbarHideAction,
        dispatchToggleUIToolbarAlwaysShowIconsAction,
        dispatchToggleUIToolbarAlwaysTransformButtonsAction,
    } = properties;

    const {
        ui,
    } = configuration;

    const {
        toolbar,
    } = ui;

    const {
        hide,
        alwaysShowIcons,
        alwaysShowTransformButtons,
    } = toolbar;

    return (
        <StyledMoreMenu
            theme={theme}
        >
            <PluridHeading
                theme={theme}
                type="h5"
            >
                toolbar
            </PluridHeading>

            <StyledMoreMenuItem>
                <div>
                    show transform icons
                </div>

                <PluridSwitch
                    theme={theme}
                    checked={alwaysShowIcons}
                    atChange={() => dispatchToggleUIToolbarAlwaysShowIconsAction()}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    show transform arrows
                </div>

                <PluridSwitch
                    theme={theme}
                    checked={alwaysShowTransformButtons}
                    atChange={() => dispatchToggleUIToolbarAlwaysTransformButtonsAction()}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    hide toolbar
                </div>

                <PluridSwitch
                    theme={theme}
                    checked={hide}
                    atChange={() => dispatchToggleUIToolbarHideAction()}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>
        </StyledMoreMenu>
    );
}


const mapStateToProps = (
    state: AppState,
): MoreMenuStateProperties => ({
    theme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MoreMenuDispatchProperties => ({
    dispatchToggleUIToolbarHideAction: () => dispatch(
        actions.configuration.toggleUIToolbarHideAction()
    ),
    dispatchToggleUIToolbarAlwaysShowIconsAction: () => dispatch(
        actions.configuration.toggleUIToolbarAlwaysShowIconsAction()
    ),
    dispatchToggleUIToolbarAlwaysTransformButtonsAction: () => dispatch(
        actions.configuration.toggleUIToolbarAlwaysTransformButtonsAction()
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MoreMenu);
