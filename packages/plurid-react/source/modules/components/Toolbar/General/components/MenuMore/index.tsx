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
    TRANSFORM_TOUCHES,

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

import Drawer from '../Drawer';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';
import {
    ViewSize,
} from '../../../../../services/state/modules/data/types'



interface MoreMenuOwnProperties {
}

interface MoreMenuStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    viewSize: ViewSize;
}

interface MoreMenuDispatchProperties {
    dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
    dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

    dispatchSetConfigurationThemeGeneralAction: typeof actions.configuration.setConfigurationThemeGeneralAction;
    dispatchSetConfigurationThemeInteractionAction: typeof actions.configuration.setConfigurationThemeInteractionAction;

    dispatchSetConfigurationPlaneOpacity: typeof actions.configuration.setConfigurationPlaneOpacity;

    dispatchToggleConfigurationViewcubeHide: typeof actions.configuration.toggleConfigurationViewcubeHide;
    dispatchToggleConfigurationViewcubeOpaque: typeof actions.configuration.toggleConfigurationViewcubeOpaque;

    dispatchToggleConfigurationToolbarConceal: typeof actions.configuration.toggleConfigurationToolbarConceal;
    dispatchToggleConfigurationToolbarTransformIcons: typeof actions.configuration.toggleConfigurationToolbarTransformIcons;
    dispatchToggleConfigurationToolbarTransformButtons: typeof actions.configuration.toggleConfigurationToolbarTransformButtons;

    dispatchToggleConfigurationSpaceShowTransformOrigin: typeof actions.configuration.toggleConfigurationSpaceShowTransformOrigin;
    dispatchSetConfigurationSpaceTransformOriginSize: typeof actions.configuration.setConfigurationSpaceTransformOriginSize;

    dispatchSetConfigurationSpaceTransformTouch: typeof actions.configuration.setConfigurationSpaceTransformTouch;
}

type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;

const MoreMenu: React.FC<MoreMenuProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        configuration,
        viewSize,

        /** dispatch */
        dispatchSetConfigurationThemeGeneralAction,
        dispatchSetConfigurationThemeInteractionAction,

        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,

        dispatchSetConfigurationPlaneOpacity,

        dispatchToggleConfigurationViewcubeHide,
        dispatchToggleConfigurationViewcubeOpaque,

        dispatchToggleConfigurationToolbarConceal,
        dispatchToggleConfigurationToolbarTransformIcons,
        dispatchToggleConfigurationToolbarTransformButtons,

        dispatchToggleConfigurationSpaceShowTransformOrigin,
        dispatchSetConfigurationSpaceTransformOriginSize,

        dispatchSetConfigurationSpaceTransformTouch,
    } = properties;

    const selectedTheme = configuration.theme;

    const transformTouch = configuration.space.transformTouch;

    const {
        viewcube,
        toolbar,
        plane,
    } = configuration.elements;

    const showViewcube = viewcube.show;
    const planeOpacity = plane.opacity;

    const {
        transformOrigin,
    } = configuration.space;

    const {
        show: showTransformOrigin,
        size: transformOriginSize,
    } = transformOrigin;

    const {
        show: showToolbar,
        transformIcons,
        transformButtons,
    } = toolbar;

    const [viewSizeSmall, setViewSizeSmall] = useState(false);

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

    useEffect(() => {
        if (viewSize.width < 800) {
            setViewSizeSmall(true);
        } else {
            setViewSizeSmall(false);
        }
    }, [
        viewSize.width,
    ]);

    return (
        <StyledMoreMenu
            theme={interactionTheme}
        >
            <StyledMoreMenuScroll>
                <Drawer
                    heading="themes"
                    items={(
                        <>
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
                        </>
                    )}
                    toggled={false}
                    toggle={() => {console.log('toggle')}}
                />


                <Drawer
                    heading="transform"
                    items={(
                        <>
                            <StyledMoreMenuItem>
                                <div>
                                    lock rotation X
                                </div>

                                <PluridSwitch
                                    theme={interactionTheme}
                                    checked={transformIcons}
                                    atChange={() => {}}
                                    exclusive={true}
                                    level={2}
                                />
                            </StyledMoreMenuItem>

                            <StyledMoreMenuItem>
                                <div>
                                    lock rotation Y
                                </div>

                                <PluridSwitch
                                    theme={interactionTheme}
                                    checked={transformIcons}
                                    atChange={() => {}}
                                    exclusive={true}
                                    level={2}
                                />
                            </StyledMoreMenuItem>

                            <StyledMoreMenuItem>
                                <div>
                                    lock translation X
                                </div>

                                <PluridSwitch
                                    theme={interactionTheme}
                                    checked={transformIcons}
                                    atChange={() => {}}
                                    exclusive={true}
                                    level={2}
                                />
                            </StyledMoreMenuItem>

                            <StyledMoreMenuItem>
                                <div>
                                    lock translation Y
                                </div>

                                <PluridSwitch
                                    theme={interactionTheme}
                                    checked={transformIcons}
                                    atChange={() => {}}
                                    exclusive={true}
                                    level={2}
                                />
                            </StyledMoreMenuItem>

                            <StyledMoreMenuItem>
                                <div>
                                    lock translation Z
                                </div>

                                <PluridSwitch
                                    theme={interactionTheme}
                                    checked={transformIcons}
                                    atChange={() => {}}
                                    exclusive={true}
                                    level={2}
                                />
                            </StyledMoreMenuItem>

                            <StyledMoreMenuItem>
                                <div>
                                    lock scale
                                </div>

                                <PluridSwitch
                                    theme={interactionTheme}
                                    checked={transformIcons}
                                    atChange={() => {}}
                                    exclusive={true}
                                    level={2}
                                />
                            </StyledMoreMenuItem>

                            <StyledMoreMenuItem>
                                <div>
                                    touch transform: {transformTouch === TRANSFORM_TOUCHES.PAN ? 'pan' : 'swipe'}
                                </div>

                                <PluridSwitch
                                    theme={interactionTheme}
                                    checked={transformTouch === TRANSFORM_TOUCHES.PAN}
                                    atChange={() => transformTouch === TRANSFORM_TOUCHES.PAN
                                        ? dispatchSetConfigurationSpaceTransformTouch(TRANSFORM_TOUCHES.SWIPE)
                                        : dispatchSetConfigurationSpaceTransformTouch(TRANSFORM_TOUCHES.PAN)
                                    }
                                    level={2}
                                />
                            </StyledMoreMenuItem>
                        </>
                    )}
                    toggled={false}
                    toggle={() => {console.log('toggle')}}
                />


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
                        atChange={() => dispatchToggleConfigurationSpaceShowTransformOrigin()}
                        exclusive={true}
                        level={2}
                        theme={interactionTheme}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    transform origin size

                    <PluridDropdown
                        selectables={['small', 'normal', 'large']}
                        selected={transformOriginSize.toLowerCase()}
                        atSelect={(selection: any) => {
                            const selected = selection.toUpperCase();
                            if (
                                selected === SIZES.SMALL
                                || selected === SIZES.NORMAL
                                || selected === SIZES.LARGE
                            ) {
                                dispatchSetConfigurationSpaceTransformOriginSize(selected);
                            }
                        }}
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
                        always opaque
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={viewcube.opaque}
                        atChange={() => dispatchToggleConfigurationViewcubeOpaque(viewcube.opaque)}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem>

                <StyledMoreMenuItem>
                    <div>
                        show transform icons
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={transformIcons}
                        atChange={() => dispatchToggleConfigurationToolbarTransformIcons()}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem>

                {!viewSizeSmall && (
                    <StyledMoreMenuItem>
                        <div>
                            show transform arrows
                        </div>

                        <PluridSwitch
                            theme={interactionTheme}
                            checked={transformButtons}
                            atChange={() => dispatchToggleConfigurationToolbarTransformButtons()}
                            exclusive={true}
                            level={2}
                        />
                    </StyledMoreMenuItem>
                )}

                <StyledMoreMenuItem>
                    <div>
                        conceal toolbar
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={showToolbar}
                        atChange={() => dispatchToggleConfigurationToolbarConceal()}
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
                        checked={viewcube.opaque}
                        atChange={() => dispatchToggleConfigurationViewcubeOpaque(viewcube.opaque)}
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
                        checked={showToolbar}
                        atChange={() => dispatchToggleConfigurationToolbarConceal()}
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
    viewSize: selectors.data.getViewSize(state),
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
    dispatchToggleConfigurationViewcubeOpaque: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationViewcubeOpaque(toggle)
    ),

    dispatchToggleConfigurationToolbarConceal: () => dispatch(
        actions.configuration.toggleConfigurationToolbarConceal()
    ),
    dispatchToggleConfigurationToolbarTransformIcons: () => dispatch(
        actions.configuration.toggleConfigurationToolbarTransformIcons()
    ),
    dispatchToggleConfigurationToolbarTransformButtons: () => dispatch(
        actions.configuration.toggleConfigurationToolbarTransformButtons()
    ),

    dispatchToggleConfigurationSpaceShowTransformOrigin: () => dispatch(
        actions.configuration.toggleConfigurationSpaceShowTransformOrigin()
    ),
    dispatchSetConfigurationSpaceTransformOriginSize: (size: keyof typeof SIZES) => dispatch(
        actions.configuration.setConfigurationSpaceTransformOriginSize(size)
    ),

    dispatchSetConfigurationSpaceTransformTouch: (
        touch: keyof typeof TRANSFORM_TOUCHES,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformTouch(touch)
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
