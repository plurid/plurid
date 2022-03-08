// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

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
    translateUp: typeof actions.space.translateUp;
    translateDown: typeof actions.space.translateDown;
    translateLeft: typeof actions.space.translateLeft;
    translateRight: typeof actions.space.translateRight;
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
                        transform={() => translateUp()}
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
                        transform={() => translateDown()}
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
