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
    StyledToolbarButtons,
    StyledToolbarTransformText,

    StyledIcon,
} from './styled';

import {
    MENUS,

    VIEW_SIZE_WIDTH_LIMIT,
} from './data';

import MenuDocuments from './components/MenuDocuments';
import MenuMore from './components/MenuMore';

import ToolbarRotate from './components/ToolbarRotate';
import ToolbarScale from './components/ToolbarScale';
import ToolbarTranslate from './components/ToolbarTranslate';

import FirstPersonIcon from '../../../assets/icons/first-person-icon';
import DocumentsIcon from '../../../assets/icons/documents-icon';
import MoreIcon from '../../../assets/icons/more-icon';

import { AppState } from '../../../services/state/store';
import StateContext from '../../../services/state/context';
import selectors from '../../../services/state/selectors';
import actions from '../../../services/state/actions';
import {
    ViewSize,
} from '../../../services/state/types/space';



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
    const [showMenu, setShowMenu] = useState<keyof typeof MENUS>(MENUS.NONE);

    const [showIcons, setShowIcons] = useState(transformIcons);
    const [showTransformButtons, setShowTransformButtons] = useState(transformButtons);

    const toggleTransform = (
        TYPE: keyof typeof TRANSFORM_MODES,
    ) => {
        if (showMenu !== MENUS.NONE) {
            setShowMenu(MENUS.NONE);
        }

        dispatchSetConfigurationSpaceTransformMode(TYPE);
    }

    const handleShowMenu = (
        menu: keyof typeof MENUS,
    ) => {
        if (showMenu === menu) {
            setShowMenu(MENUS.NONE);
        } else {
            dispatchSetConfigurationSpaceTransformMode(TRANSFORM_MODES.ALL);
            setShowMenu(menu);
        }
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

    return (
        <StyledToolbar
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
            mouseIn={mouseIn}
            conceal={conceal}
            showMenu={showMenu}
        >
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


                <ToolbarRotate
                    showTransformButtons={showTransformButtons}
                    showIcons={showIcons}
                    transformMode={transformMode}
                    toggleTransform={toggleTransform}
                />

                <ToolbarScale
                    showTransformButtons={showTransformButtons}
                    showIcons={showIcons}
                    transformMode={transformMode}
                    toggleTransform={toggleTransform}
                />

                <ToolbarTranslate
                    showTransformButtons={showTransformButtons}
                    showIcons={showIcons}
                    transformMode={transformMode}
                    toggleTransform={toggleTransform}
                />


                {documentsBased && (
                    <StyledToolbarTransformText
                        theme={theme}
                        onClick={() => handleShowMenu(MENUS.DOCUMENTS)}
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
                    onClick={() => handleShowMenu(MENUS.MORE)}
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
    viewSize: selectors.space.getViewSize(state),
    documents: selectors.data.getDocuments(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ToolbarDispatchProperties => ({
    dispatchToggleConfigurationSpaceFirstPerson: () => dispatch(
        actions.configuration.toggleConfigurationSpaceFirstPerson(),
    ),

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
