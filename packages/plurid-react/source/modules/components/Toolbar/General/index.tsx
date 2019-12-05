import React, {
    useRef,
    useState,
    useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    StyledToolbar,
    StyledToolbarButtons,
    StyledToolbarRotate,
    StyledToolbarTranslate,
    StyledToolbarScale,
    StyledToolbarTransformButton,
    StyledToolbarTransformText,

    StyledIcon,
} from './styled';

import MenuDocuments from './components/MenuDocuments';
import MenuMore from './components/MenuMore';

import FirstPersonIcon from '../../../assets/icons/first-person-icon';
import RotateIcon from '../../../assets/icons/rotate-icon';
import TranslateIcon from '../../../assets/icons/translate-icon';
import ScaleIcon from '../../../assets/icons/scale-icon';
import DocumentsIcon from '../../../assets/icons/documents-icon';
import MoreIcon from '../../../assets/icons/more-icon';

import { AppState } from '../../../services/state/store';
import StateContext from '../../../services/state/context';
import selectors from '../../../services/state/selectors';
import actions from '../../../services/state/actions';
import {
    ViewSize,
} from '../../../services/state/modules/data/types'



enum MENUS {
    NONE,
    DOCUMENTS,
    MORE,
}

interface ToolbarOwnProperties {
}

interface ToolbarStateProperties {
    theme: Theme;
    configuration: PluridConfiguration;
    viewSize: ViewSize;
    firstPerson: boolean;
    rotationLocked: boolean;
    translationLocked: boolean;
    scaleLocked: boolean;
    documents: any;
}

interface ToolbarDispatchProperties {
    dispatchToggleFirstPerson: typeof actions.space.toggleFirstPerson;

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
    const moreMenuTimeout = useRef<null | number>(null);

    const {
        /** state */
        theme,
        configuration,
        firstPerson,
        rotationLocked,
        translationLocked,
        scaleLocked,
        viewSize,
        documents,

        /** dispatch */
        dispatchToggleFirstPerson,

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

    const {
        ui,
    } = configuration;

    const {
        toolbar,
    } = ui;

    const {
        hide,
        alwaysShowIcons,
        alwaysShowTransformButtons,
    } = toolbar;

    const [mouseIn, setMouseIn] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showMenu, setShowMenu] = useState(MENUS.NONE);

    const [showIcons, setShowIcons] = useState(alwaysShowIcons);
    const [showTransformButtons, setShowTransformButtons] = useState(alwaysShowTransformButtons);

    const toggleTransform = (
        type: string,
    ) => {
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

    /** ViewSize Update */
    useEffect(() => {
        if (viewSize.width < 800) {
            if (alwaysShowTransformButtons) {
                setShowTransformButtons(false);
            }
        }

        if (viewSize.width > 800) {
            setShowTransformButtons(alwaysShowTransformButtons);
        }
    }, [
        viewSize.width,
    ]);

    /** Local State Update */
    useEffect(() => {
        setShowIcons(alwaysShowIcons);
        setShowTransformButtons(alwaysShowTransformButtons);
    }, [
        alwaysShowIcons,
        alwaysShowTransformButtons,
    ]);

    /** Hide More Menu at Mouse Out */
    useEffect(() => {
        if (mouseIn && moreMenuTimeout.current) {
            clearTimeout(moreMenuTimeout.current);
        }

        if (!mouseIn) {
            moreMenuTimeout.current = setTimeout(() => {
                setShowMoreMenu(false);
            }, 400);
        }
    }, [
        mouseIn,
    ]);

    return (
        <StyledToolbar
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
            mouseIn={mouseIn}
            hideToolbar={hide}
        >
            <StyledToolbarButtons
                theme={theme}
                showIcons={showIcons}
                showTransformButtons={showTransformButtons}
            >
                <StyledToolbarTransformText
                    theme={theme}
                    onClick={() => dispatchToggleFirstPerson()}
                    active={firstPerson}
                    button={true}
                >
                    <StyledIcon>
                        {FirstPersonIcon}
                    </StyledIcon>
                </StyledToolbarTransformText>


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

                {Object.keys(documents).length > 1 && (
                    <StyledToolbarTransformText
                        theme={theme}
                        onClick={() => showMenu === MENUS.DOCUMENTS
                            ? setShowMenu(MENUS.NONE)
                            : setShowMenu(MENUS.DOCUMENTS)
                        }
                        active={showMenu === MENUS.DOCUMENTS}
                        button={true}
                    >
                        <StyledIcon>
                            {DocumentsIcon}
                        </StyledIcon>
                    </StyledToolbarTransformText>
                )}

                <StyledToolbarTransformText
                    theme={theme}
                    onClick={() => showMenu === MENUS.MORE
                        ? setShowMenu(MENUS.NONE)
                        : setShowMenu(MENUS.MORE)
                    }
                    active={showMenu === MENUS.MORE}
                    button={true}
                >
                    <StyledIcon>
                        {MoreIcon}
                    </StyledIcon>
                </StyledToolbarTransformText>
            </StyledToolbarButtons>

            {showMenu === MENUS.DOCUMENTS && (
                <MenuDocuments />
            )}

            {showMenu === MENUS.MORE && (
                <MenuMore />
            )}
        </StyledToolbar>
    );
}


const mapStateToProps = (state: AppState): ToolbarStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    theme: selectors.themes.getInteractionTheme(state),
    viewSize: selectors.data.getViewSize(state),
    firstPerson: selectors.space.getFirstPerson(state),
    rotationLocked: selectors.space.getRotationLocked(state),
    translationLocked: selectors.space.getTranslationLocked(state),
    scaleLocked: selectors.space.getScaleLocked(state),
    documents: selectors.data.getDocuments(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ToolbarDispatchProperties => ({
    dispatchToggleFirstPerson: () => dispatch(actions.space.toggleFirstPerson()),

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
