import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledToolbar,
    StyledToolbarButtons,
    StyledToolbarRotate,
    StyledToolbarTranslate,
    StyledToolbarScale,
    StyledToolbarTransformButton,
    StyledToolbarTransformText,

    StyledIcon,
    StyledMoreMenu,
} from './styled';

// import ToolbarButton from '../Button';

import { Theme } from '@plurid/plurid-themes';

import RotateIcon from '../../../assets/icons/rotate-icon';
import TranslateIcon from '../../../assets/icons/translate-icon';
import ScaleIcon from '../../../assets/icons/scale-icon';
import MoreIcon from '../../../assets/icons/more-icon';

import { AppState } from '../../../services/state/store';
import StateContext from '../../../services/state/context';
import selectors from '../../../services/state/selectors';
import actions from '../../../services/state/actions';



interface ToolbarOwnProperties {
}

interface ToolbarStateProperties {
    theme: Theme;

    rotationLocked: boolean;
    translationLocked: boolean;
    scaleLocked: boolean;
}

interface ToolbarDispatchProperties {
    rotateUp: typeof actions.space.rotateUp;
    rotateDown: typeof actions.space.rotateDown;
    rotateLeft: typeof actions.space.rotateLeft;
    rotateRight: typeof actions.space.rotateRight;

    scaleUp: typeof actions.space.scaleUp;
    scaleDown: typeof actions.space.scaleDown;

    translateUp: typeof actions.space.translateUp;
    translateDown: typeof actions.space.translateDown;
    translateLeft: typeof actions.space.translateLeft;
    translateRight: typeof actions.space.translateRight;

    dispatchToggleRotationLocked: typeof actions.space.toggleRotationLocked;
    dispatchToggleTranslationLocked: typeof actions.space.toggleTranslationLocked;
    dispatchToggleScaleLocked: typeof actions.space.toggleScaleLocked;
}

type ToolbarProperties = ToolbarOwnProperties
    & ToolbarStateProperties
    & ToolbarDispatchProperties;

const Toolbar: React.FC<ToolbarProperties> = (properties) => {
    const [mouseIn, setMouseIn] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const {
        /** state */
        theme,

        rotationLocked,
        translationLocked,
        scaleLocked,


        /** dispatch */
        rotateUp,
        rotateDown,
        rotateLeft,
        rotateRight,

        scaleUp,
        scaleDown,

        translateUp,
        translateDown,
        translateLeft,
        translateRight,

        dispatchToggleRotationLocked,
        dispatchToggleTranslationLocked,
        dispatchToggleScaleLocked,
    } = properties;

    const toggleTransform = (type: string) => {
        switch (type) {
            case 'rotate':
                dispatchToggleRotationLocked();
                break;
            case 'translate':
                dispatchToggleTranslationLocked();
                break;
            case 'scale':
                    dispatchToggleScaleLocked();
                break;
        }
    }

    const showIcons = true;
    const showTransformButtons = false;

    return (
        <StyledToolbar
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
        >
            <StyledToolbarButtons
                theme={theme}
                showIcons={showIcons}
                showTransformButtons={showTransformButtons}
            >
                <StyledToolbarRotate
                    showTransformButtons={showTransformButtons}
                >
                    {showTransformButtons && (
                        <>
                            <StyledToolbarTransformButton
                                theme={theme}
                                onClick={rotateRight}
                            >
                                ◀
                            </StyledToolbarTransformButton>

                            <StyledToolbarTransformButton
                                theme={theme}
                                onClick={rotateUp}
                            >
                                ▲
                            </StyledToolbarTransformButton>
                        </>
                    )}

                    <StyledToolbarTransformText
                        theme={theme}
                        onClick={() => toggleTransform('rotate')}
                        active={rotationLocked}
                        showIcons={showIcons}
                        showTransformButtons={showTransformButtons}
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
                    </StyledToolbarTransformText>

                    {showTransformButtons && (
                        <>
                            <StyledToolbarTransformButton
                                theme={theme}
                                onClick={rotateDown}
                            >
                                ▼
                            </StyledToolbarTransformButton>

                            <StyledToolbarTransformButton
                                theme={theme}
                                onClick={rotateLeft}
                            >
                                ▶
                            </StyledToolbarTransformButton>
                        </>
                    )}
                </StyledToolbarRotate>

                <StyledToolbarScale
                    showTransformButtons={showTransformButtons}
                >
                    {showTransformButtons && (
                        <StyledToolbarTransformButton
                            theme={theme}
                            onClick={scaleUp}
                        >
                            ▲
                        </StyledToolbarTransformButton>
                    )}

                    <StyledToolbarTransformText
                        theme={theme}
                        onClick={() => toggleTransform('scale')}
                        active={scaleLocked}
                        showIcons={showIcons}
                        showTransformButtons={showTransformButtons}
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
                        <StyledToolbarTransformButton
                            theme={theme}
                            onClick={scaleDown}
                        >
                            ▼
                        </StyledToolbarTransformButton>
                    )}
                </StyledToolbarScale>

                <StyledToolbarTranslate
                    showTransformButtons={showTransformButtons}
                >
                    {showTransformButtons && (
                        <>
                            <StyledToolbarTransformButton
                                theme={theme}
                                onClick={translateLeft}
                            >
                                ◀
                            </StyledToolbarTransformButton>

                            <StyledToolbarTransformButton
                                theme={theme}
                                onClick={translateUp}
                            >
                                ▲
                            </StyledToolbarTransformButton>
                        </>
                    )}

                    <StyledToolbarTransformText
                        theme={theme}
                        onClick={() => toggleTransform('translate')}
                        active={translationLocked}
                        showIcons={showIcons}
                        showTransformButtons={showTransformButtons}
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
                    </StyledToolbarTransformText>

                    {showTransformButtons && (
                        <>
                            <StyledToolbarTransformButton
                                theme={theme}
                                onClick={translateDown}
                            >
                                ▼
                            </StyledToolbarTransformButton>

                            <StyledToolbarTransformButton
                                theme={theme}
                                onClick={translateRight}
                            >
                                ▶
                            </StyledToolbarTransformButton>
                        </>
                    )}
                </StyledToolbarTranslate>

                <StyledToolbarTransformText
                    theme={theme}
                    onClick={() => setShowMoreMenu(show => !show)}
                    active={showMoreMenu}
                    showIcons={showIcons}
                    showTransformButtons={showTransformButtons}
                >
                    <StyledIcon>
                        {MoreIcon}
                    </StyledIcon>
                </StyledToolbarTransformText>
            </StyledToolbarButtons>

            {showMoreMenu && (
                <StyledMoreMenu
                    theme={theme}
                >
                    <div>
                        always show icons
                    </div>

                    <div>
                        always show transform buttons
                    </div>
                </StyledMoreMenu>
            )}
        </StyledToolbar>
    );
}


const mapStateToProps = (state: AppState): ToolbarStateProperties => ({
    theme: selectors.themes.getInteractionTheme(state),

    rotationLocked: selectors.space.getRotationLocked(state),
    translationLocked: selectors.space.getTranslationLocked(state),
    scaleLocked: selectors.space.getScaleLocked(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ToolbarDispatchProperties => ({
    rotateUp: () => dispatch(actions.space.rotateUp()),
    rotateDown: () => dispatch(actions.space.rotateDown()),
    rotateLeft: () => dispatch(actions.space.rotateLeft()),
    rotateRight: () => dispatch(actions.space.rotateRight()),

    scaleUp: () => dispatch(actions.space.scaleUp()),
    scaleDown: () => dispatch(actions.space.scaleDown()),

    translateUp: () => dispatch(actions.space.translateUp()),
    translateDown: () => dispatch(actions.space.translateDown()),
    translateLeft: () => dispatch(actions.space.translateLeft()),
    translateRight: () => dispatch(actions.space.translateRight()),

    dispatchToggleRotationLocked: () => dispatch(
        actions.space.toggleRotationLocked()
    ),
    dispatchToggleTranslationLocked: () => dispatch(
        actions.space.toggleTranslationLocked()
    ),
    dispatchToggleScaleLocked: () => dispatch(
        actions.space.toggleScaleLocked()
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(Toolbar);
