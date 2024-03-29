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
        PluridIconTranslate,
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
        StyledPluridToolbarTranslate,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridToolbarTranslateOwnProperties {
    showTransformButtons: boolean;
    showIcons: boolean;
    transformMode: keyof typeof TRANSFORM_MODES;
    toggleTransform(TYPE: keyof typeof TRANSFORM_MODES): void;
}

export interface PluridToolbarTranslateStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
}

export interface PluridToolbarTranslateDispatchProperties {
    translateUp: DispatchActionWithoutPayload<typeof actions.space.translateUp>;
    translateDown: DispatchActionWithoutPayload<typeof actions.space.translateDown>;
    translateLeft: DispatchActionWithoutPayload<typeof actions.space.translateLeft>;
    translateRight: DispatchActionWithoutPayload<typeof actions.space.translateRight>;
    translateIn: DispatchActionWithoutPayload<typeof actions.space.translateIn>;
    translateOut: DispatchActionWithoutPayload<typeof actions.space.translateOut>;
}

export type PluridToolbarTranslateProperties = PluridToolbarTranslateOwnProperties
    & PluridToolbarTranslateStateProperties
    & PluridToolbarTranslateDispatchProperties;


const PluridToolbarTranslate: React.FC<PluridToolbarTranslateProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        showTransformButtons,
        showIcons,
        transformMode,
        toggleTransform,
        // #endregion own

        // #region state
        stateLanguage,
        interactionTheme,
        // #endregion state

        // #region dispatch
        translateUp,
        translateDown,
        translateLeft,
        translateRight,
        translateIn,
        translateOut,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledPluridToolbarTranslate
            showTransformButtons={showTransformButtons}
        >
            {showTransformButtons && (
                <>
                    <PluridTransformArrow
                        direction="left"
                        transform={() => translateLeft()}
                    />

                    <PluridTransformArrow
                        direction="up"
                        transform={(event) => {
                            if (event.altKey) {
                                translateOut();
                            } else {
                                translateUp();
                            }
                        }}
                    />
                </>
            )}

            <StyledToolbarButton
                theme={interactionTheme}
                onClick={() => toggleTransform(TRANSFORM_MODES.TRANSLATION)}
                active={transformMode === TRANSFORM_MODES.TRANSLATION}
                showIcons={showIcons}
                showTransformButtons={showTransformButtons}
                button={showIcons}
            >
                {showIcons
                    ? (
                        <StyledIcon>
                            <PluridIconTranslate />
                        </StyledIcon>
                    ) : (
                        <>
                            {internatiolate(stateLanguage, internationalization.fields.toolbarTransformTranslate)}
                        </>
                    )
                }
            </StyledToolbarButton>

            {showTransformButtons && (
                <>
                    <PluridTransformArrow
                        direction="down"
                        transform={(event) => {
                            if (event.altKey) {
                                translateIn();
                            } else {
                                translateDown();
                            }
                        }}
                    />

                    <PluridTransformArrow
                        direction="right"
                        transform={() => translateRight()}
                    />
                </>
            )}
        </StyledPluridToolbarTranslate>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridToolbarTranslateStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridToolbarTranslateDispatchProperties => ({
    translateUp: () => dispatch(
        actions.space.translateUp(),
    ),
    translateDown: () => dispatch(
        actions.space.translateDown(),
    ),
    translateLeft: () => dispatch(
        actions.space.translateLeft(),
    ),
    translateRight: () => dispatch(
        actions.space.translateRight(),
    ),
    translateIn: () => dispatch(
        actions.space.translateIn(),
    ),
    translateOut: () => dispatch(
        actions.space.translateOut(),
    ),
});


const ConnectedPluridToolbarTranslate = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridToolbarTranslate);
// #endregion module



// #region exports
export default ConnectedPluridToolbarTranslate;
// #endregion exports
