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
    StyledToolbarScale,
} from './styled';

import {
    StyledToolbarTransformText,
    StyledIcon,
} from '../../styled';

import TransformArrow from '../TransformArrow';

import ScaleIcon from '../../../../../assets/icons/scale-icon';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



interface ToolbarScaleOwnProperties {
    showTransformButtons: boolean;
    showIcons: boolean;
    transformMode: keyof typeof TRANSFORM_MODES;
    toggleTransform(TYPE: keyof typeof TRANSFORM_MODES): void;
}

interface ToolbarScaleStateProperties {
    interactionTheme: Theme;
}

interface ToolbarScaleDispatchProperties {
    scaleUp: typeof actions.space.scaleUp;
    scaleDown: typeof actions.space.scaleDown;
}

type ToolbarScaleProperties = ToolbarScaleOwnProperties
    & ToolbarScaleStateProperties
    & ToolbarScaleDispatchProperties;

const ToolbarScale: React.FC<ToolbarScaleProperties> = (properties) => {
    const {
        /** own */
        showTransformButtons,
        showIcons,
        transformMode,
        toggleTransform,

        /** state */
        interactionTheme,

        /** dispatch */
        scaleUp,
        scaleDown,
    } = properties;

    return (
        <StyledToolbarScale
            showTransformButtons={showTransformButtons}
        >
            {showTransformButtons && (
                <TransformArrow
                    direction="up"
                    transform={() => scaleUp()}
                />
            )}

            <StyledToolbarTransformText
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
                            {ScaleIcon}
                        </StyledIcon>
                    ) : (
                        <>scale</>
                    )
                }
            </StyledToolbarTransformText>

            {showTransformButtons && (
                <TransformArrow
                    direction="down"
                    transform={() => scaleDown()}
                />
            )}
        </StyledToolbarScale>
    );
}


const mapStateToProps = (
    state: AppState,
): ToolbarScaleStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ToolbarScaleDispatchProperties => ({
    scaleUp: () => dispatch(actions.space.scaleUp()),
    scaleDown: () => dispatch(actions.space.scaleDown()),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(ToolbarScale);
