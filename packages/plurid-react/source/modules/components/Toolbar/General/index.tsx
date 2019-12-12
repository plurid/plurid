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

    TRANSFORM_MODES,
} from '@plurid/plurid-data';

import {
    StyledToolbar,
    StyledToolbarButtonsContainer,
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

const VIEW_SIZE_WIDTH_LIMIT = 800;

interface ToolbarOwnProperties {
}

interface ToolbarStateProperties {
    theme: Theme;
    configuration: PluridConfiguration;
    viewSize: ViewSize;
    documents: any;
}

interface ToolbarDispatchProperties {
    dispatchToggleConfigurationSpaceFirstPerson: typeof actions.configuration.toggleConfigurationSpaceFirstPerson;

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

    dispatchSetConfigurationSpaceTransformMode: typeof actions.configuration.setConfigurationSpaceTransformMode;
}

type ToolbarProperties = ToolbarOwnProperties
    & ToolbarStateProperties
    & ToolbarDispatchProperties;

const Toolbar: React.FC<ToolbarProperties> = (properties) => {
    const menuTimeout = useRef<null | number>(null);

    const {
        /** state */
        theme,
        configuration,
        viewSize,
        documents,

        /** dispatch */
        dispatchToggleConfigurationSpaceFirstPerson,

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

        dispatchSetConfigurationSpaceTransformMode,
    } = properties;

    const {
        firstPerson,
        transformMode,
    } = configuration.space;

    const {
        toolbar,
    } = configuration.elements;

    const {
        conceal,
        opaque,
        transformIcons,
        transformButtons,
    } = toolbar;

    const documentsBased = Object.keys(documents).length > 1;

    const [mouseIn, setMouseIn] = useState(false);
    const [showMenu, setShowMenu] = useState(MENUS.NONE);

    const [showIcons, setShowIcons] = useState(transformIcons);
    const [showTransformButtons, setShowTransformButtons] = useState(transformButtons);

    const toggleTransform = (
        TYPE: keyof typeof TRANSFORM_MODES,
    ) => {
        dispatchSetConfigurationSpaceTransformMode(TYPE);
    }

    /** ViewSize Update */
    useEffect(() => {
        if (viewSize.width < VIEW_SIZE_WIDTH_LIMIT) {
            if (transformButtons) {
                setShowTransformButtons(false);
            }
        }

        if (viewSize.width > VIEW_SIZE_WIDTH_LIMIT) {
            setShowTransformButtons(transformButtons);
        }
    }, [
        viewSize.width,
    ]);

    /** Local State Update */
    useEffect(() => {
        setShowIcons(transformIcons);
        setShowTransformButtons(transformButtons);
    }, [
        transformIcons,
        transformButtons,
    ]);

    /** Hide Menu at Mouse Out */
    useEffect(() => {
        if (mouseIn && menuTimeout.current) {
            clearTimeout(menuTimeout.current);
        }

        if (!mouseIn) {
            menuTimeout.current = setTimeout(() => {
                setShowMenu(MENUS.NONE);
            }, 400);
        }
    }, [
        mouseIn,
    ]);

    console.log(opaque);

    return (
        <StyledToolbar
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
            mouseIn={mouseIn}
            hideToolbar={conceal}
            showMenu={showMenu}
        >
            <StyledToolbarButtonsContainer>
                <StyledToolbarButtons
                    theme={theme}
                    showIcons={showIcons}
                    showTransformButtons={showTransformButtons}
                    documentsBased={documentsBased}
                    mouseIn={mouseIn}
                    opaque={opaque}
                >
                    <StyledToolbarTransformText
                        theme={theme}
                        onClick={() => dispatchToggleConfigurationSpaceFirstPerson()}
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

                    {documentsBased && (
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
            </StyledToolbarButtonsContainer>

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
    documents: selectors.data.getDocuments(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ToolbarDispatchProperties => ({
    dispatchToggleConfigurationSpaceFirstPerson: () => dispatch(
        actions.configuration.toggleConfigurationSpaceFirstPerson(),
    ),

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

    dispatchSetConfigurationSpaceTransformMode: (
        mode: keyof typeof TRANSFORM_MODES,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformMode(mode)
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
