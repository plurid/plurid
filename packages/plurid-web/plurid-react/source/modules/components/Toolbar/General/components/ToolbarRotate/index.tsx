import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

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

import {
    StyledPluridToolbarRotate,
} from './styled';

import {
    StyledToolbarButton,
    StyledIcon,
} from '../../styled';

import PluridTransformArrow from '../TransformArrow';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



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
    rotateUp: typeof actions.space.rotateUp;
    rotateDown: typeof actions.space.rotateDown;
    rotateLeft: typeof actions.space.rotateLeft;
    rotateRight: typeof actions.space.rotateRight;
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


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridToolbarRotate);
