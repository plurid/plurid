import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import themes, {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    PluridHeading,
    PluridDropdown,
    PluridSwitch,
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenu,
    StyledMoreMenuItem,
    StyledMoreMenuScroll,
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
    dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
    dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

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
        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,
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

    const setGeneralTheme = (selectedTheme: any) => {
        dispatchSetGeneralTheme(themes[selectedTheme])
    }

    const setInteractionTheme = (selectedTheme: any) => {
        dispatchSetInteractionTheme(themes[selectedTheme])
    }

    return (
        <StyledMoreMenu
            theme={theme}
        >
            <StyledMoreMenuScroll>
                {/* THEMES */}
                <PluridHeading
                    theme={theme}
                    type="h5"
                >
                    themes
                </PluridHeading>

                <StyledMoreMenuItem>
                    general theme

                    <PluridDropdown
                        selectables={Object.keys(themes)}
                        selected="plurid"
                        atSelect={(selection) => setGeneralTheme(selection)}
                        theme={theme}
                        heightItems={4}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    interaction theme

                    <PluridDropdown
                        selectables={Object.keys(themes)}
                        selected="plurid"
                        atSelect={(selection) => setInteractionTheme(selection)}
                        theme={theme}
                        heightItems={4}
                    />
                </StyledMoreMenuItem>



                {/* TOOLBAR */}
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
            </StyledMoreMenuScroll>
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
    dispatchSetGeneralTheme: (theme: Theme) => dispatch(
        actions.themes.setGeneralTheme(theme)
    ),
    dispatchSetInteractionTheme: (theme: Theme) => dispatch(
        actions.themes.setInteractionTheme(theme)
    ),
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
