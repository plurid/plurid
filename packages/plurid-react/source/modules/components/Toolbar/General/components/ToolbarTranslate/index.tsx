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
    StyledToolbarTranslate,
} from './styled';

import {
    StyledToolbarButton,
    StyledIcon,
} from '../../styled';

import TransformArrow from '../TransformArrow';

import TranslateIcon from '../../../../../assets/icons/translate-icon';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



interface ToolbarTranslateOwnProperties {
    showTransformButtons: boolean;
    showIcons: boolean;
    transformMode: keyof typeof TRANSFORM_MODES;
    toggleTransform(TYPE: keyof typeof TRANSFORM_MODES): void;
}

interface ToolbarTranslateStateProperties {
    interactionTheme: Theme;
}

interface ToolbarTranslateDispatchProperties {
    translateUp: typeof actions.space.translateUp;
    translateDown: typeof actions.space.translateDown;
    translateLeft: typeof actions.space.translateLeft;
    translateRight: typeof actions.space.translateRight;
}

type ToolbarTranslateProperties = ToolbarTranslateOwnProperties
    & ToolbarTranslateStateProperties
    & ToolbarTranslateDispatchProperties;

const ToolbarTranslate: React.FC<ToolbarTranslateProperties> = (properties) => {
    const {
        /** own */
        showTransformButtons,
        showIcons,
        transformMode,
        toggleTransform,

        /** state */
        interactionTheme,

        /** dispatch */
        translateUp,
        translateDown,
        translateLeft,
        translateRight,
    } = properties;


    return (
        <StyledToolbarTranslate
            showTransformButtons={showTransformButtons}
        >
            {showTransformButtons && (
                <>
                    <TransformArrow
                        direction="left"
                        transform={() => translateLeft()}
                    />

                    <TransformArrow
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
                            {TranslateIcon}
                        </StyledIcon>
                    ) : (
                        <>translate</>
                    )
                }
            </StyledToolbarButton>

            {showTransformButtons && (
                <>
                    <TransformArrow
                        direction="down"
                        transform={() => translateDown()}
                    />

                    <TransformArrow
                        direction="right"
                        transform={() => translateRight()}
                    />
                </>
            )}
        </StyledToolbarTranslate>
    );
}


const mapStateToProps = (
    state: AppState,
): ToolbarTranslateStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ToolbarTranslateDispatchProperties => ({
    translateUp: () => dispatch(actions.space.translateUp()),
    translateDown: () => dispatch(actions.space.translateDown()),
    translateLeft: () => dispatch(actions.space.translateLeft()),
    translateRight: () => dispatch(actions.space.translateRight()),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(ToolbarTranslate);
