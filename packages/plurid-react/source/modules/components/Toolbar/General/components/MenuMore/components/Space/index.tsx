import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,
    layoutNames,

    SIZES,
    LAYOUT_TYPES,
} from '@plurid/plurid-data';

import {
    PluridDropdown,
    PluridSwitch,
    PluridSlider,
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';



interface MenuMoreSpaceOwnProperties {
}

interface MenuMoreSpaceStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

interface MenuMoreSpaceDispatchProperties {
    dispatchSetConfigurationPlaneOpacity: typeof actions.configuration.setConfigurationPlaneOpacity;

    dispatchToggleConfigurationSpaceShowTransformOrigin: typeof actions.configuration.toggleConfigurationSpaceShowTransformOrigin;
    dispatchSetConfigurationSpaceTransformOriginSize: typeof actions.configuration.setConfigurationSpaceTransformOriginSize;
    dispatchSetConfigurationSpaceLayoutType: typeof actions.configuration.setConfigurationSpaceLayoutType;
}

type MenuMoreSpaceProperties = MenuMoreSpaceOwnProperties
    & MenuMoreSpaceStateProperties
    & MenuMoreSpaceDispatchProperties;

const MenuMoreSpace: React.FC<MenuMoreSpaceProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchSetConfigurationPlaneOpacity,

        dispatchToggleConfigurationSpaceShowTransformOrigin,
        dispatchSetConfigurationSpaceTransformOriginSize,
        dispatchSetConfigurationSpaceLayoutType,
    } = properties;

    const layout = configuration.space.layout;

    const layoutType = layoutNames[layout.type];

    const planeOpacity = configuration.elements.plane.opacity;

    const {
        transformOrigin,
    } = configuration.space;
    const {
        show: showTransformOrigin,
        size: transformOriginSize,
    } = transformOrigin;

    return (
        <>
            <StyledMoreMenuItem>
                show transform origin

                <PluridSwitch
                    checked={showTransformOrigin}
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
                    thumbSize="large"
                    level={2}
                    theme={interactionTheme}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                layout type

                <PluridDropdown
                    selectables={[...Object.values(layoutNames)]}
                    selected={layoutType}
                    atSelect={(selection: any) => {
                        const selected = selection.toUpperCase().replace(' ', '_');
                        console.log(selected);
                        dispatchSetConfigurationSpaceLayoutType(selected);
                    }}
                    heightItems={3}
                    theme={interactionTheme}
                    width={100}
                />
            </StyledMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): MenuMoreSpaceStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MenuMoreSpaceDispatchProperties => ({
    dispatchSetConfigurationPlaneOpacity: (value: number) => dispatch(
        actions.configuration.setConfigurationPlaneOpacity(value)
    ),

    dispatchToggleConfigurationSpaceShowTransformOrigin: () => dispatch(
        actions.configuration.toggleConfigurationSpaceShowTransformOrigin()
    ),
    dispatchSetConfigurationSpaceTransformOriginSize: (
        size: keyof typeof SIZES,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformOriginSize(size)
    ),
    dispatchSetConfigurationSpaceLayoutType: (
        layoutType: keyof typeof LAYOUT_TYPES,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceLayoutType(layoutType),
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MenuMoreSpace);
