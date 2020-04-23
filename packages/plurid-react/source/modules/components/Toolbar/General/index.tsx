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
    /** constants */
    PLURID_ENTITY_TOOLBAR,

    /** enumerations */
    TRANSFORM_MODES,

    /** interfaces */
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    StyledToolbar,
    StyledToolbarButtons,
    StyledToolbarButton,

    StyledIcon,
} from './styled';

import {
    MENUS,

    VIEW_SIZE_WIDTH_LIMIT,
} from './data';

import MenuUniverses from './components/MenuUniverses';
import MenuMore from './components/MenuMore';

import ToolbarRotate from './components/ToolbarRotate';
import ToolbarScale from './components/ToolbarScale';
import ToolbarTranslate from './components/ToolbarTranslate';

import {
    PluridIconFirstPerson,
    PluridIconDocuments,
    PluridIconMore,
} from '@plurid/plurid-icons-react';

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
    universes: any;
}

interface ToolbarDispatchProperties {
    dispatchToggleConfigurationSpaceFirstPerson: typeof actions.configuration.toggleConfigurationSpaceFirstPerson;

    dispatchSetConfigurationSpaceTransformMode: typeof actions.configuration.setConfigurationSpaceTransformMode;
}

type ToolbarProperties = ToolbarOwnProperties
    & ToolbarStateProperties
    & ToolbarDispatchProperties;


const Toolbar: React.FC<ToolbarProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        theme,
        configuration,
        viewSize,
        universes,

        /** dispatch */
        dispatchToggleConfigurationSpaceFirstPerson,
        dispatchSetConfigurationSpaceTransformMode,
    } = properties;

    const {
        transparentUI,
        elements,
        space,
    } = configuration;

    const {
        firstPerson,
        transformMode,
    } = space;

    const {
        toolbar,
    } = elements;

    const {
        conceal,
        opaque,
        transformIcons,
        transformButtons,
    } = toolbar;

    const universesBased = Object.keys(universes).length > 1;


    /** references */
    const menuTimeout = useRef<null | number>(null);


    /** state */
    const [mouseIn, setMouseIn] = useState(false);
    const [showMenu, setShowMenu] = useState<keyof typeof MENUS>(MENUS.NONE);

    const [showIcons, setShowIcons] = useState(transformIcons);
    const [showTransformButtons, setShowTransformButtons] = useState(transformButtons);


    /** handlers */
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


    /** effects */
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


    /** render */
    return (
        <StyledToolbar
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
            mouseIn={mouseIn}
            conceal={conceal}
            showMenu={showMenu}
            data-plurid-entity={PLURID_ENTITY_TOOLBAR}
        >
            <StyledToolbarButtons
                theme={theme}
                showIcons={showIcons}
                showTransformButtons={showTransformButtons}
                universesBased={universesBased}
                mouseIn={mouseIn}
                opaque={opaque}
                transparentUI={transparentUI}
            >
                <StyledToolbarButton
                    theme={theme}
                    onClick={() => dispatchToggleConfigurationSpaceFirstPerson()}
                    active={firstPerson}
                    button={true}
                >
                    <StyledIcon>
                        <PluridIconFirstPerson />
                    </StyledIcon>
                </StyledToolbarButton>


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


                {universesBased && (
                    <StyledToolbarButton
                        theme={theme}
                        onClick={() => handleShowMenu(MENUS.UNIVERSES)}
                        active={showMenu === MENUS.UNIVERSES}
                        button={true}
                    >
                        <StyledIcon>
                            <PluridIconDocuments />
                        </StyledIcon>
                    </StyledToolbarButton>
                )}

                <StyledToolbarButton
                    theme={theme}
                    onClick={() => handleShowMenu(MENUS.MORE)}
                    active={showMenu === MENUS.MORE}
                    button={true}
                >
                    <StyledIcon>
                        <PluridIconMore />
                    </StyledIcon>
                </StyledToolbarButton>
            </StyledToolbarButtons>

            {showMenu === MENUS.UNIVERSES && (
                <MenuUniverses />
            )}

            {showMenu === MENUS.MORE && (
                <MenuMore />
            )}
        </StyledToolbar>
    );
}


const mapStateToProps = (
    state: AppState,
): ToolbarStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    theme: selectors.themes.getInteractionTheme(state),
    viewSize: selectors.space.getViewSize(state),
    universes: selectors.data.getUniverses(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ToolbarDispatchProperties => ({
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
