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
        PluridIconRotate,
    } from '@plurid/plurid-icons-react';

    import {
        internationalization,

        TRANSFORM_MODES,

        InternationalizationLanguageType,
    } from '@plurid/plurid-data';

    import {
        internatiolate,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
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
        StyledPluridToolbarRotate,
    } from './styled';

    import PluridTransformArrow from '../TransformArrow';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridToolbarRotateOwnProperties {
    showTransformButtons: boolean;
    showIcons: boolean;
    transformMode: keyof typeof TRANSFORM_MODES;
    toggleTransform(TYPE: keyof typeof TRANSFORM_MODES): void;
}

export interface PluridToolbarRotateStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
}

export interface PluridToolbarRotateDispatchProperties {
    rotateUp: DispatchActionWithoutPayload<typeof actions.space.rotateUp>;
    rotateDown: DispatchActionWithoutPayload<typeof actions.space.rotateDown>;
    rotateLeft: DispatchActionWithoutPayload<typeof actions.space.rotateLeft>;
    rotateRight: DispatchActionWithoutPayload<typeof actions.space.rotateRight>;
}

export type PluridToolbarRotateProperties = PluridToolbarRotateOwnProperties
    & PluridToolbarRotateStateProperties
    & PluridToolbarRotateDispatchProperties;

const PluridToolbarRotate: React.FC<PluridToolbarRotateProperties> = (
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
        rotateUp,
        rotateDown,
        rotateLeft,
        rotateRight,
    } = properties;


    /** render */
    return (
        <StyledPluridToolbarRotate
            showTransformButtons={showTransformButtons}
        >
            {showTransformButtons && (
                <>
                    <PluridTransformArrow
                        direction="left"
                        transform={() => rotateRight()}
                    />

                    <PluridTransformArrow
                        direction="up"
                        transform={() => rotateUp()}
                    />
                </>
            )}

            <StyledToolbarButton
                theme={interactionTheme}
                onClick={() => toggleTransform(TRANSFORM_MODES.ROTATION)}
                active={transformMode === TRANSFORM_MODES.ROTATION}
                showIcons={showIcons}
                showTransformButtons={showTransformButtons}
                button={showIcons}
            >
                {showIcons
                    ? (
                        <StyledIcon>
                            <PluridIconRotate />
                        </StyledIcon>
                    ) : (
                        <>
                            {internatiolate(stateLanguage, internationalization.fields.toolbarTransformRotate)}
                        </>
                    )
                }
            </StyledToolbarButton>

            {showTransformButtons && (
                <>
                    <PluridTransformArrow
                        direction="down"
                        transform={() => rotateDown()}
                    />

                    <PluridTransformArrow
                        direction="right"
                        transform={() => rotateLeft()}
                    />
                </>
            )}
        </StyledPluridToolbarRotate>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridToolbarRotateStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridToolbarRotateDispatchProperties => ({
    rotateUp: () => dispatch(
        actions.space.rotateUp(),
    ),
    rotateDown: () => dispatch(
        actions.space.rotateDown(),
    ),
    rotateLeft: () => dispatch(
        actions.space.rotateLeft(),
    ),
    rotateRight: () => dispatch(
        actions.space.rotateRight(),
    ),
});


const ConnectedPluridToolbarRotate = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridToolbarRotate);
// #endregion module



// #region exports
export default ConnectedPluridToolbarRotate;
// #endregion exports
