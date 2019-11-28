import React, {
    useState,
    useEffect,
} from 'react';
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

    dispatchSetConfigurationThemeGeneralAction: typeof actions.configuration.setConfigurationThemeGeneralAction;
    dispatchSetConfigurationThemeInteractionAction: typeof actions.configuration.setConfigurationThemeInteractionAction;

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
        dispatchSetConfigurationThemeGeneralAction,
        dispatchSetConfigurationThemeInteractionAction,
        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,
        dispatchToggleUIToolbarHideAction,
        dispatchToggleUIToolbarAlwaysShowIconsAction,
        dispatchToggleUIToolbarAlwaysTransformButtonsAction,
    } = properties;

    const {
        theme: selectedTheme,
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

    const [generalThemeName, setGeneralThemeName] = useState(typeof selectedTheme === 'object' ? selectedTheme.general : selectedTheme);
    const [interactionThemeName, setInteractionThemeName] = useState(typeof selectedTheme === 'object' ? selectedTheme.interaction : selectedTheme);

    const setGeneralTheme = (selectedTheme: any) => {
        dispatchSetGeneralTheme(themes[selectedTheme]);
        dispatchSetConfigurationThemeGeneralAction(selectedTheme);
    }

    const setInteractionTheme = (selectedTheme: any) => {
        dispatchSetInteractionTheme(themes[selectedTheme]);
        dispatchSetConfigurationThemeInteractionAction(selectedTheme);
    }

    useEffect(() => {
        if (typeof selectedTheme === 'object') {
            setGeneralThemeName(selectedTheme.general);
            setInteractionThemeName(selectedTheme.interaction);
        } else {
            setGeneralThemeName(selectedTheme);
            setInteractionThemeName(selectedTheme);
        }
    }, [
        selectedTheme,
    ]);

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
                        selected={generalThemeName}
                        atSelect={(selection) => setGeneralTheme(selection)}
                        theme={theme}
                        heightItems={4}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    interaction theme

                    <PluridDropdown
                        selectables={Object.keys(themes)}
                        selected={interactionThemeName}
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
    dispatchSetConfigurationThemeGeneralAction: (theme: string) => dispatch(
        actions.configuration.setConfigurationThemeGeneralAction(theme)
    ),
    dispatchSetConfigurationThemeInteractionAction: (theme: string) => dispatch(
        actions.configuration.setConfigurationThemeInteractionAction(theme)
    ),

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
