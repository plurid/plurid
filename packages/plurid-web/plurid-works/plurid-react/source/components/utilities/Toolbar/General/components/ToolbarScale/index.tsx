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
        PluridIconScale,
    } from '@plurid/plurid-icons-react';

    import {
        TRANSFORM_MODES,
        internationalization,

        InternationalizationLanguageType,
    } from '@plurid/plurid-data';

    import {
        internatiolate,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import PluridTransformArrow from '../TransformArrow';

    import {
        StyledToolbarButton,
        StyledIcon,
    } from '../../styled';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchActionWithoutPayload,
    } from '~data/interfaces';
    // #endregion external


    // #region internal
    import {
        StyledPluridToolbarScale,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridToolbarScaleOwnProperties {
    showTransformButtons: boolean;
    showIcons: boolean;
    transformMode: keyof typeof TRANSFORM_MODES;
    toggleTransform(TYPE: keyof typeof TRANSFORM_MODES): void;
}

export interface PluridToolbarScaleStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
}

export interface PluridToolbarScaleDispatchProperties {
    scaleUp: DispatchActionWithoutPayload<typeof actions.space.scaleUp>;
    scaleDown: DispatchActionWithoutPayload<typeof actions.space.scaleDown>;
}

export type PluridToolbarScaleProperties = PluridToolbarScaleOwnProperties
    & PluridToolbarScaleStateProperties
    & PluridToolbarScaleDispatchProperties;


const PluridToolbarScale: React.FC<PluridToolbarScaleProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        showTransformButtons,
        showIcons,
        transformMode,
        toggleTransform,

        /** state */
        stateLanguage,
        interactionTheme,

        /** dispatch */
        scaleUp,
        scaleDown,
    } = properties;


    /** render */
    return (
        <StyledPluridToolbarScale
            showTransformButtons={showTransformButtons}
        >
            {showTransformButtons && (
                <PluridTransformArrow
                    direction="up"
                    transform={() => scaleUp()}
                />
            )}

            <StyledToolbarButton
                theme={interactionTheme}
                onClick={() => toggleTransform(TRANSFORM_MODES.SCALE)}
                active={transformMode === TRANSFORM_MODES.SCALE}
                showIcons={showIcons}
                showTransformButtons={showTransformButtons}
                button={showIcons}
            >
                {showIcons
                    ? (
                        <StyledIcon>
                            <PluridIconScale />
                        </StyledIcon>
                    ) : (
                        <>
                            {internatiolate(stateLanguage, internationalization.fields.toolbarTransformScale)}
                        </>
                    )
                }
            </StyledToolbarButton>

            {showTransformButtons && (
                <PluridTransformArrow
                    direction="down"
                    transform={() => scaleDown()}
                />
            )}
        </StyledPluridToolbarScale>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridToolbarScaleStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridToolbarScaleDispatchProperties => ({
    scaleUp: () => dispatch(actions.space.scaleUp()),
    scaleDown: () => dispatch(actions.space.scaleDown()),
});


const ConnectedPluridToolbarScale = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridToolbarScale);
// #endregion module




// #region exports
export default ConnectedPluridToolbarScale;
// #endregion exports
