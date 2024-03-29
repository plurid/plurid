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

        TRANSFORM_TOUCHES,

        PluridConfiguration,
        InternationalizationLanguageType,
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

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchAction,
    } from '~data/interfaces';
    // #endregion libraries
// #endregion imports



// #region module
const {
    inputs: {
        Switch: PluridSwitch,
    },
} = universal;

export interface PluridMenuMoreTransformOwnProperties {
}

export interface PluridMenuMoreTransformStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridMenuMoreTransformDispatchProperties {
    dispatchToggleConfigurationSpaceTransformMultimode: DispatchAction<typeof actions.configuration.toggleConfigurationSpaceTransformMultimode>;
    dispatchSetConfigurationSpaceTransformTouch: DispatchAction<typeof actions.configuration.setConfigurationSpaceTransformTouch>;
    dispatchSetConfigurationSpaceTransformLocks: DispatchAction<typeof actions.configuration.setConfigurationSpaceTransformLocks>;
}

export type PluridMenuMoreTransformProperties = PluridMenuMoreTransformOwnProperties
    & PluridMenuMoreTransformStateProperties
    & PluridMenuMoreTransformDispatchProperties;


const PluridMenuMoreTransform: React.FC<PluridMenuMoreTransformProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchToggleConfigurationSpaceTransformMultimode,
        dispatchSetConfigurationSpaceTransformTouch,
        dispatchSetConfigurationSpaceTransformLocks,
    } = properties;

    const {
        transformMultimode,
        transformLocks,
        transformTouch,
    } = configuration.space;


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformMultiModeTransform)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformMultimode}
                    atChange={() => dispatchToggleConfigurationSpaceTransformMultimode(!transformMultimode)}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowRotationX)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.rotationX}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('rotationX')}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowRotationY)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.rotationY}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('rotationY')}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowTranslationX)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.translationX}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('translationX')}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowTranslationY)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.translationY}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('translationY')}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowTranslationZ)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.translationZ}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('translationZ')}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowScale)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.scale}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('scale')}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem
                last={true}
            >
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformTouchTransform)}
                    :&nbsp;{transformTouch === TRANSFORM_TOUCHES.PAN
                        ? 'pan'
                        : 'swipe'
                    }
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
            </StyledPluridMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreTransformStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreTransformDispatchProperties => ({
    dispatchToggleConfigurationSpaceTransformMultimode: (
        multimode,
    ) => dispatch(
        actions.configuration.toggleConfigurationSpaceTransformMultimode(multimode),
    ),
    dispatchSetConfigurationSpaceTransformTouch: (
        touch: keyof typeof TRANSFORM_TOUCHES,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformTouch(touch as any),
    ),
    dispatchSetConfigurationSpaceTransformLocks: (
        lock: string,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformLocks(lock),
    ),
});


const ConnectedPluridMenuMoreTransform = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreTransform);
// #endregion module



// #region exports
export default ConnectedPluridMenuMoreTransform;
// #endregion exports
