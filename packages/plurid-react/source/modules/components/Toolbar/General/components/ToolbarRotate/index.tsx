import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    TRANSFORM_MODES,
} from '@plurid/plurid-data';

import {
    StyledToolbarRotate,
} from './styled';

import {
    StyledToolbarButton,
    StyledIcon,
} from '../../styled';

import TransformArrow from '../TransformArrow';

import RotateIcon from '../../../../../assets/icons/rotate-icon';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



interface ToolbarRotateOwnProperties {
    showTransformButtons: boolean;
    showIcons: boolean;
    transformMode: keyof typeof TRANSFORM_MODES;
    toggleTransform(TYPE: keyof typeof TRANSFORM_MODES): void;
}

interface ToolbarRotateStateProperties {
    interactionTheme: Theme;
}

interface ToolbarRotateDispatchProperties {
    rotateUp: typeof actions.space.rotateUp;
    rotateDown: typeof actions.space.rotateDown;
    rotateLeft: typeof actions.space.rotateLeft;
    rotateRight: typeof actions.space.rotateRight;
}

type ToolbarRotateProperties = ToolbarRotateOwnProperties
    & ToolbarRotateStateProperties
    & ToolbarRotateDispatchProperties;

const ToolbarRotate: React.FC<ToolbarRotateProperties> = (properties) => {
    const {
        /** own */
        showTransformButtons,
        showIcons,
        transformMode,
        toggleTransform,

        /** state */
        interactionTheme,

        /** dispatch */
        rotateUp,
        rotateDown,
        rotateLeft,
        rotateRight,
    } = properties;


    return (
        <StyledToolbarRotate
            showTransformButtons={showTransformButtons}
        >
            {showTransformButtons && (
                <>
                    <TransformArrow
                        direction="left"
                        transform={() => rotateRight()}
                    />

                    <TransformArrow
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
                            {RotateIcon}
                        </StyledIcon>
                    ) : (
                        <>rotate</>
                    )
                }
            </StyledToolbarButton>

            {showTransformButtons && (
                <>
                    <TransformArrow
                        direction="down"
                        transform={() => rotateDown()}
                    />

                    <TransformArrow
                        direction="right"
                        transform={() => rotateLeft()}
                    />
                </>
            )}
        </StyledToolbarRotate>
    );
}


const mapStateToProps = (
    state: AppState,
): ToolbarRotateStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ToolbarRotateDispatchProperties => ({
    rotateUp: () => dispatch(actions.space.rotateUp()),
    rotateDown: () => dispatch(actions.space.rotateDown()),
    rotateLeft: () => dispatch(actions.space.rotateLeft()),
    rotateRight: () => dispatch(actions.space.rotateRight()),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(ToolbarRotate);
