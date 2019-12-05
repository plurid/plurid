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
    defaultShortcuts,
    shortcutsNames,

    SIZES,

    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    PluridHeading,
    PluridDropdown,
    PluridSwitch,
    PluridSlider,
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
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    showTransformOrigin: boolean;
    transformOriginSize: any;
}

interface MoreMenuDispatchProperties {
    dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
    dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

    dispatchSetConfigurationThemeGeneralAction: typeof actions.configuration.setConfigurationThemeGeneralAction;
    dispatchSetConfigurationThemeInteractionAction: typeof actions.configuration.setConfigurationThemeInteractionAction;

    dispatchSetConfigurationPlaneOpacity: typeof actions.configuration.setConfigurationPlaneOpacity;

    dispatchToggleConfigurationViewcubeHide: typeof actions.configuration.toggleConfigurationViewcubeHide;
    dispatchToggleConfigurationUIViewcubeTransparent: typeof actions.configuration.toggleConfigurationUIViewcubeTransparent;

    dispatchToggleUIToolbarHideAction: typeof actions.configuration.toggleUIToolbarHideAction;
    dispatchToggleUIToolbarAlwaysShowIconsAction: typeof actions.configuration.toggleUIToolbarAlwaysShowIconsAction;
    dispatchToggleUIToolbarAlwaysTransformButtonsAction: typeof actions.configuration.toggleUIToolbarAlwaysTransformButtonsAction;

    dispatchToggleShowTransformOrigin: typeof actions.space.toggleShowTransformOrigin;
    dispatchSetTransformOriginSize: typeof actions.space.setTransformOriginSize;
}

type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;

const MoreMenu: React.FC<MoreMenuProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        configuration,
        showTransformOrigin,
        transformOriginSize,

        /** dispatch */
        dispatchSetConfigurationThemeGeneralAction,
        dispatchSetConfigurationThemeInteractionAction,

        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,

        dispatchSetConfigurationPlaneOpacity,

        dispatchToggleConfigurationViewcubeHide,
        dispatchToggleConfigurationUIViewcubeTransparent,

        dispatchToggleUIToolbarHideAction,
        dispatchToggleUIToolbarAlwaysShowIconsAction,
        dispatchToggleUIToolbarAlwaysTransformButtonsAction,

        dispatchToggleShowTransformOrigin,
        dispatchSetTransformOriginSize,
    } = properties;

    const {
        theme: selectedTheme,
        ui,
        viewcube: showViewcube,
        planeOpacity,
    } = configuration;

    const {
        toolbar,
        viewcube,
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
            theme={interactionTheme}
        >
            <StyledMoreMenuScroll>
                {/* LOCKS */}
                {/* <PluridHeading
                    theme={theme}
                    type="h5"
                >
                    locks
                </PluridHeading>

                <StyledMoreMenuItem>
                    <div>
                        lock rotation X
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
                        lock scale
                    </div>

                    <PluridSwitch
                        theme={theme}
                        checked={alwaysShowIcons}
                        atChange={() => dispatchToggleUIToolbarAlwaysShowIconsAction()}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem> */}



                {/* THEMES */}
                <PluridHeading
                    theme={interactionTheme}
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
                        theme={interactionTheme}
                        heightItems={4}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    interaction theme

                    <PluridDropdown
                        selectables={Object.keys(themes)}
                        selected={interactionThemeName}
                        atSelect={(selection) => setInteractionTheme(selection)}
                        theme={interactionTheme}
                        heightItems={3}
                    />
                </StyledMoreMenuItem>



                {/* SPACE */}
                <PluridHeading
                    theme={interactionTheme}
                    type="h5"
                >
                    space
                </PluridHeading>

                <StyledMoreMenuItem>
                    hide transform origin

                    <PluridSwitch
                        checked={!showTransformOrigin}
                        atChange={() => dispatchToggleShowTransformOrigin()}
                        exclusive={true}
                        level={2}
                        theme={interactionTheme}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    transform origin size

                    <PluridDropdown
                        selectables={['small', 'normal', 'large']}
                        selected={transformOriginSize}
                        atSelect={(selection: any) => dispatchSetTransformOriginSize(selection)}
                        heightItems={3}
                        theme={interactionTheme}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    plane opacity

                    <PluridSlider
                        value={planeOpacity}
                        max={1}
                        min={0}
                        step={0.1}
                        defaultValue={100}
                        atChange={(value: number) => dispatchSetConfigurationPlaneOpacity(value)}
                        thumbSize="small"
                        level={2}
                        theme={interactionTheme}
                    />
                </StyledMoreMenuItem>



                {/* TOOLBAR */}
                <PluridHeading
                    theme={interactionTheme}
                    type="h5"
                >
                    toolbar
                </PluridHeading>

                <StyledMoreMenuItem>
                    <div>
                        show transform icons
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
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
                        theme={interactionTheme}
                        checked={alwaysShowTransformButtons}
                        atChange={() => dispatchToggleUIToolbarAlwaysTransformButtonsAction()}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    <div>
                        conceal toolbar
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={hide}
                        atChange={() => dispatchToggleUIToolbarHideAction()}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem>



                {/* VIEWCUBE */}
                <PluridHeading
                    theme={interactionTheme}
                    type="h5"
                >
                    viewcube
                </PluridHeading>

                <StyledMoreMenuItem>
                    <div>
                        always opaque
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={!viewcube.transparent}
                        atChange={() => dispatchToggleConfigurationUIViewcubeTransparent(!viewcube.transparent)}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    <div>
                        conceal viewcube
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={hide}
                        atChange={() => dispatchToggleUIToolbarHideAction()}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    <div>
                        hide viewcube
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={!showViewcube}
                        atChange={() => dispatchToggleConfigurationViewcubeHide(!showViewcube)}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem>



                {/* SHORTCUTS */}
                <PluridHeading
                    theme={interactionTheme}
                    type="h5"
                >
                    shortcuts
                </PluridHeading>

                {defaultShortcuts.map(shortcut => {
                    const {
                        type,
                    } = shortcut;
                    const shortcutData = shortcutsNames[type];
                    const {
                        name,
                        key,
                        modifier,
                    } = shortcutData;
                    const modifierString = Array.isArray(modifier)
                        ? modifier.reduce((total, element) => total + ' + ' + element) + ' +'
                        : typeof modifier === 'string'
                            ? modifier + ' +'
                            : '';

                    return (
                        <StyledMoreMenuItem
                            key={name}
                            afterline={
                                type === 'TURN_DOWN'
                                || type === 'TOGGLE_ROTATE'
                                || type === 'TOGGLE_TRANSLATE'
                            }
                        >
                            <div>
                                {name}
                            </div>

                            <div>
                                {modifierString} {key}
                            </div>
                        </StyledMoreMenuItem>
                    );
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

    showTransformOrigin: selectors.space.getShowTransformOrigin(state),
    transformOriginSize: selectors.space.getTransformOriginSize(state),
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

    dispatchSetConfigurationPlaneOpacity: (value: number) => dispatch(
        actions.configuration.setConfigurationPlaneOpacity(value)
    ),

    dispatchToggleConfigurationViewcubeHide: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationViewcubeHide(toggle)
    ),
    dispatchToggleConfigurationUIViewcubeTransparent: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationUIViewcubeTransparent(toggle)
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

    dispatchToggleShowTransformOrigin: () => dispatch(
        actions.space.toggleShowTransformOrigin()
    ),
    dispatchSetTransformOriginSize: (size: keyof typeof SIZES) => dispatch(
        actions.space.setTransformOriginSize(size)
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
