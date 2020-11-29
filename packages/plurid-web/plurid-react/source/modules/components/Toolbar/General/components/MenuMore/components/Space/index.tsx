import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    internationalization,
    layoutNames,

    SIZES,
    LAYOUT_TYPES,

    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    internatiolate,
} from '@plurid/plurid-engine';

import {
    universal,
} from '@plurid/plurid-ui-components-react';

import {
    StyledPluridMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';



const {
    inputs: {
        Dropdown: PluridDropdown,
        Switch: PluridSwitch,
        Slider: PluridSlider,
    },
} = universal;

export interface PluridMenuMoreSpaceOwnProperties {
}

export interface PluridMenuMoreSpaceStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridMenuMoreSpaceDispatchProperties {
    dispatchSetConfigurationPlaneOpacity: typeof actions.configuration.setConfigurationPlaneOpacity;

    dispatchToggleConfigurationSpaceTransparentUI: typeof actions.configuration.toggleConfigurationSpaceTransparentUI;
    dispatchToggleConfigurationSpaceShowTransformOrigin: typeof actions.configuration.toggleConfigurationSpaceShowTransformOrigin;
    dispatchSetConfigurationSpaceTransformOriginSize: typeof actions.configuration.setConfigurationSpaceTransformOriginSize;
    dispatchSetConfigurationSpaceLayoutType: typeof actions.configuration.setConfigurationSpaceLayoutType;
}

export type PluridMenuMoreSpaceProperties = PluridMenuMoreSpaceOwnProperties
    & PluridMenuMoreSpaceStateProperties
    & PluridMenuMoreSpaceDispatchProperties;


const PluridMenuMoreSpace: React.FC<PluridMenuMoreSpaceProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchSetConfigurationPlaneOpacity,

        dispatchToggleConfigurationSpaceTransparentUI,
        dispatchToggleConfigurationSpaceShowTransformOrigin,
        dispatchSetConfigurationSpaceTransformOriginSize,
        dispatchSetConfigurationSpaceLayoutType,
    } = properties;

    const {
        global,
        space,
        elements,
    } = configuration;

    const {
        transparentUI,
        language,
    } = global;

    const {
        layout,
        transformOrigin,
    } = space;

    const layoutType = layoutNames[layout.type];

    const {
        show: showTransformOrigin,
        size: transformOriginSize,
    } = transformOrigin;

    const planeOpacity = elements.plane.opacity;


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem>
                {internatiolate(language, internationalization.fields.toolbarDrawerSpaceTransparentUserInterface)}

                <PluridSwitch
                    checked={transparentUI}
                    atChange={() => dispatchToggleConfigurationSpaceTransparentUI()}
                    exclusive={true}
                    level={2}
                    theme={interactionTheme}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                {internatiolate(language, internationalization.fields.toolbarDrawerSpaceShowTransformOrigin)}

                <PluridSwitch
                    checked={showTransformOrigin}
                    atChange={() => dispatchToggleConfigurationSpaceShowTransformOrigin()}
                    exclusive={true}
                    level={2}
                    theme={interactionTheme}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                {internatiolate(language, internationalization.fields.toolbarDrawerSpaceTransformOriginSize)}

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
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                {internatiolate(language, internationalization.fields.toolbarDrawerSpacePlaneOpacity)}

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
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem
                last={true}
            >
                {internatiolate(language, internationalization.fields.toolbarDrawerSpaceLayoutType)}

                <PluridDropdown
                    selectables={[...Object.values(layoutNames)]}
                    selected={layoutType}
                    atSelect={(selection: any) => {
                        const selected = selection.toUpperCase().replace(/\s/g, '_');
                        dispatchSetConfigurationSpaceLayoutType(selected);
                    }}
                    heightItems={3}
                    theme={interactionTheme}
                    width={100}
                />
            </StyledPluridMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreSpaceStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreSpaceDispatchProperties => ({
    dispatchSetConfigurationPlaneOpacity: (value: number) => dispatch(
        actions.configuration.setConfigurationPlaneOpacity(value)
    ),

    dispatchToggleConfigurationSpaceTransparentUI: () => dispatch(
        actions.configuration.toggleConfigurationSpaceTransparentUI()
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
)(PluridMenuMoreSpace);
