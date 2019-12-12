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

import MenuMoreThemes from './components/Themes';
import MenuMoreTransform from './components/Transform';
import MenuMoreSpace from './components/Space';
import MenuMoreToolbar from './components/Toolbar';
import MenuMoreViewcube from './components/Viewcube';
import MenuMoreShortcuts from './components/Shortcuts';

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
                <Drawer
                    heading="themes"
                    items={(
                        <MenuMoreThemes />
                    )}
                    toggled={toggledDrawers.includes(TOOLBAR_DRAWERS.THEMES)}
                    toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.THEMES)}
                />

                <Drawer
                    heading="transform"
                    items={(
                        <MenuMoreTransform />
                    )}
                    toggled={toggledDrawers.includes(TOOLBAR_DRAWERS.TRANSFORM)}
                    toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.TRANSFORM)}
                />

                <Drawer
                    heading="space"
                    items={(
                        <MenuMoreSpace />
                    )}
                    toggled={toggledDrawers.includes(TOOLBAR_DRAWERS.SPACE)}
                    toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.SPACE)}
                />

                <Drawer
                    heading="toolbar"
                    items={(
                        <MenuMoreToolbar />
                    )}
                    toggled={toggledDrawers.includes(TOOLBAR_DRAWERS.TOOLBAR)}
                    toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.TOOLBAR)}
                />

                <Drawer
                    heading="viewcube"
                    items={(
                        <MenuMoreViewcube />
                    )}
                    toggled={toggledDrawers.includes(TOOLBAR_DRAWERS.VIEWCUBE)}
                    toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.VIEWCUBE)}
                />

                <Drawer
                    heading="shortcuts"
                    items={(
                        <MenuMoreShortcuts />
                    )}
                    toggled={toggledDrawers.includes(TOOLBAR_DRAWERS.SHORTCUTS)}
                    toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.SHORTCUTS)}
                />
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
