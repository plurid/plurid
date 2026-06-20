// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        internationalization,

        PluridConfiguration,
        InternationalizationLanguageType,
    } from '@plurid/plurid-data';

    import {
        internatiolate,
    } from '@plurid/plurid-engine';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';
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
        Switch: PluridSwitch,
    },
} = universal;


export interface PluridMenuMoreMinimapStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridMenuMoreMinimapDispatchProperties {
    dispatchToggleConfigurationMinimapHide: DispatchAction<typeof actions.configuration.toggleConfigurationMinimapHide>;
    dispatchToggleConfigurationMinimapTransparent: DispatchAction<typeof actions.configuration.toggleConfigurationMinimapTransparent>;
}

export type PluridMenuMoreMinimapProperties =
    & PluridMenuMoreMinimapStateProperties
    & PluridMenuMoreMinimapDispatchProperties;


const PluridMenuMoreMinimap: React.FC<PluridMenuMoreMinimapProperties> = (
    properties,
) => {
    /** properties */
    const {
        stateLanguage,
        interactionTheme,
        configuration,

        dispatchToggleConfigurationMinimapHide,
        dispatchToggleConfigurationMinimapTransparent,
    } = properties;

    const minimap = configuration.elements.minimap;
    const show = minimap?.show ?? false;
    const transparent = minimap?.transparent ?? true;


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem
                last={!show ? true : false}
            >
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerMinimapShowMinimap)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={show}
                    atChange={() => dispatchToggleConfigurationMinimapHide(!show)}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            {show && (
                <StyledPluridMoreMenuItem
                    last={true}
                >
                    <div>
                        {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerMinimapTransparent)}
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={transparent}
                        atChange={() => dispatchToggleConfigurationMinimapTransparent(!transparent)}
                        exclusive={true}
                        level={2}
                    />
                </StyledPluridMoreMenuItem>
            )}
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreMinimapStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreMinimapDispatchProperties => ({
    dispatchToggleConfigurationMinimapHide: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationMinimapHide(toggle)
    ),
    dispatchToggleConfigurationMinimapTransparent: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationMinimapTransparent(toggle)
    ),
});


const ConnectedPluridMenuMoreMinimap = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreMinimap);
// #endregion module



// #region exports
export default ConnectedPluridMenuMoreMinimap;
// #endregion exports
