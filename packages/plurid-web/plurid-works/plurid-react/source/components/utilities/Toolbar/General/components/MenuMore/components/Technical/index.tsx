// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        internationalization,

        PluridConfiguration,
        InternationalizationLanguageType,
    } from '@plurid/plurid-data';

    import {
        internatiolate,
    } from '@plurid/plurid-engine';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';

    import {
        useDebouncedCallback,
    } from '@plurid/plurid-functions-react';
    // #endregion libraries


    // #region external
    import {
        StyledPluridMoreMenuItem,
    } from '../../styled';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchAction,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const {
    inputs: {
        Slider: PluridSlider,
    },
} = universal;

export interface PluridMenuMoreTechnicalOwnProperties {
}

export interface PluridMenuMoreTechnicalStateProperties {
    stateLanguage: InternationalizationLanguageType;
    stateConfiguration: PluridConfiguration;
    stateInteractionTheme: Theme;
}

export interface PluridMenuMoreTechnicalDispatchProperties {
    dispatchSetConfigurationSpaceCullingDistance: DispatchAction<typeof actions.configuration.setConfigurationSpaceCullingDistance>;
}

export type PluridMenuMoreTechnicalProperties = PluridMenuMoreTechnicalOwnProperties
    & PluridMenuMoreTechnicalStateProperties
    & PluridMenuMoreTechnicalDispatchProperties;


const PluridMenuMoreTechnical: React.FC<PluridMenuMoreTechnicalProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        stateConfiguration,
        stateInteractionTheme,

        /** dispatch */
        dispatchSetConfigurationSpaceCullingDistance,
    } = properties;

    const {
        cullingDistance,
    } = stateConfiguration.space;


    /** state */
    const [localCullingDistance, setLocalCullingDistance] = useState(cullingDistance);


    /** callback */
    const dispatchCullingDistanceUpdateFunction = (
        value: number,
    ) => {
        dispatchSetConfigurationSpaceCullingDistance(value);
    }

    const dispatchCullingDistanceUpdate = useDebouncedCallback(
        dispatchCullingDistanceUpdateFunction,
        300,
    );


    /** handlers */
    const handleCullingDistance = (
        value: number,
    ) => {
        setLocalCullingDistance(value);
        dispatchCullingDistanceUpdate(value);
    }


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTechnicalCullingDistance)}
                </div>

                <PluridSlider
                    theme={stateInteractionTheme}
                    value={localCullingDistance}
                    atChange={handleCullingDistance}
                    min={1_000}
                    max={5_000}
                    defaultValue={1_500}
                />
            </StyledPluridMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreTechnicalStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreTechnicalDispatchProperties => ({
    dispatchSetConfigurationSpaceCullingDistance: (
        value,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceCullingDistance(value),
    ),
});


const ConnectedPluridMenuMoreTechnical = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreTechnical);
// #endregion module



// #region exports
export default ConnectedPluridMenuMoreTechnical;
// #endregion exports
