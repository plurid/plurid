import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    TOOLBAR_DRAWERS,

    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    StyledMoreMenu,
    StyledMoreMenuScroll,
} from './styled';

import Drawer from '../Drawer';

import {
    moreMenus,
} from './data';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';






interface MoreMenuOwnProperties {
}

interface MoreMenuStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

interface MoreMenuDispatchProperties {
    dispatchToggleConfigurationToolbarToggleDrawer: typeof actions.configuration.toggleConfigurationToolbarToggleDrawer;
}

type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;

const MoreMenu: React.FC<MoreMenuProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchToggleConfigurationToolbarToggleDrawer,
    } = properties;

    const {
        toolbar,
    } = configuration.elements;

    const {
        toggledDrawers,
    } = toolbar;

    return (
        <StyledMoreMenu
            theme={interactionTheme}
        >
            <StyledMoreMenuScroll>
                {moreMenus.map(moreMenu => {
                    const {
                        name,
                        drawer,
                        component,
                    } = moreMenu;

                    return (
                        <Drawer
                            key={name}
                            heading={name}
                            items={(
                                <>{component}</>
                            )}
                            toggled={toggledDrawers.includes(drawer)}
                            toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(drawer)}
                        />
                    )
                })}
            </StyledMoreMenuScroll>
        </StyledMoreMenu>
    );
}


const mapStateToProps = (
    state: AppState,
): MoreMenuStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MoreMenuDispatchProperties => ({
    dispatchToggleConfigurationToolbarToggleDrawer: (
        drawer: keyof typeof TOOLBAR_DRAWERS,
    ) => dispatch(
        actions.configuration.toggleConfigurationToolbarToggleDrawer(drawer),
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
