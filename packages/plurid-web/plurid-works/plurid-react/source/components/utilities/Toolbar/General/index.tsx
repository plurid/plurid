// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
        useId,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


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
        PluridIconFirstPerson,
        PluridIconDocuments,
        PluridIconMore,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchAction,
    } from '~data/interfaces';
    // import {
    //     ViewSize,
    // } from '~services/state/types/space';
    // #endregion external


    // #region internal
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
    // #endregion internal
// #endregion imports



// #region module
export interface PluridToolbarOwnProperties {
}

export interface PluridToolbarStateProperties {
    theme: Theme;
    configuration: PluridConfiguration;
    // viewSize: ViewSize;
    viewSize: any;
    // universes: any;
}

export interface PluridToolbarDispatchProperties {
    dispatchToggleConfigurationSpaceFirstPerson: DispatchAction<typeof actions.configuration.toggleConfigurationSpaceFirstPerson>;
    dispatchSetConfigurationSpaceTransformMode: DispatchAction<typeof actions.configuration.setConfigurationSpaceTransformMode>;
}

export type PluridToolbarProperties = PluridToolbarOwnProperties
    & PluridToolbarStateProperties
    & PluridToolbarDispatchProperties;


const PluridToolbar: React.FC<PluridToolbarProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** state */
        theme,
        configuration,
        viewSize,
        // universes,

        /** dispatch */
        dispatchToggleConfigurationSpaceFirstPerson,
        dispatchSetConfigurationSpaceTransformMode,
    } = properties;

    const {
        global,
        elements,
        space,
    } = configuration;

    const {
        transparentUI,
    } = global;

    const {
        firstPerson,
        transformMode,
        fadeInTime,
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

    const showToolbar = toolbar.show;
    // const universesBased = Object.keys(universes).length > 1;
    // #endregion properties


    // #region references
    const menuTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
    const toolbarElement = useRef<HTMLDivElement>(null);
    const moreButton = useRef<HTMLButtonElement>(null);
    const focusMenuOnOpen = useRef(false);
    const menuID = 'plurid-toolbar-menu-' + useId().replace(/[^A-Za-z0-9_-]/g, '');
    // #endregion references


    // #region state
    const [mouseIn, setMouseIn] = useState(false);
    const [showMenu, setShowMenu] = useState<keyof typeof MENUS>(MENUS.NONE);

    const [showIcons, setShowIcons] = useState(transformIcons);
    const [showTransformButtons, setShowTransformButtons] = useState(transformButtons);

    const [
        isMounted,
        setIsMounted,
    ] = useState(false);
    // #endregion state


    // #region handlers
    const toggleTransform = (
        TYPE: keyof typeof TRANSFORM_MODES,
    ) => {
        if (showMenu !== MENUS.NONE) {
            setShowMenu(MENUS.NONE);
        }

        dispatchSetConfigurationSpaceTransformMode(TYPE as any);
    }

    const handleShowMenu = (
        menu: keyof typeof MENUS,
        fromKeyboard = false,
    ) => {
        if (showMenu === menu) {
            setShowMenu(MENUS.NONE);
        } else {
            dispatchSetConfigurationSpaceTransformMode(TRANSFORM_MODES.ALL);
            setShowMenu(menu);
            // a keyboard reader goes into what they opened
            focusMenuOnOpen.current = fromKeyboard;
        }
    }

    /** Escape closes the menu and hands the focus back to the button that opened it. */
    const closeMenuOnEscape = (
        event: React.KeyboardEvent,
    ) => {
        if (event.key !== 'Escape' || showMenu === MENUS.NONE) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        setShowMenu(MENUS.NONE);
        moreButton.current?.focus();
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        setIsMounted(true);
    }, []);

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
                // not while the keyboard is inside: the menu unmounted under a focused drawer and
                // the focus fell to the body, where no key of the space works
                if (
                    typeof document !== 'undefined'
                    && toolbarElement.current
                    && toolbarElement.current.contains(document.activeElement)
                ) {
                    return;
                }
                setShowMenu(MENUS.NONE);
            }, 400);
        }

        return () => {
            if (menuTimeout.current) {
                clearTimeout(menuTimeout.current);
            }
        }
    }, [
        mouseIn,
    ]);
    // opened from the keyboard: the focus goes to the menu's first control
    useEffect(() => {
        if (showMenu === MENUS.NONE || !focusMenuOnOpen.current) {
            return;
        }
        focusMenuOnOpen.current = false;
        const menu = typeof document !== 'undefined' ? document.getElementById(menuID) : null;
        const first = menu?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        first?.focus();
    }, [
        showMenu,
    ]);
    // #endregion effects


    // #region render
    if (!showToolbar) {
        return (<></>);
    }

    return (
        <StyledToolbar
            ref={toolbarElement}
            onKeyDown={closeMenuOnEscape}
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
            mouseIn={mouseIn}
            conceal={conceal}
            showMenu={showMenu}
            isMounted={isMounted}
            fadeInTime={fadeInTime}
            data-plurid-entity={PLURID_ENTITY_TOOLBAR}
        >
            <StyledToolbarButtons
                theme={theme}
                showIcons={showIcons}
                showTransformButtons={showTransformButtons}
                documentsBased={false}
                // universesBased={universesBased}
                mouseIn={mouseIn}
                opaque={opaque}
                transparentUI={transparentUI}
>
                <StyledToolbarButton
                    theme={theme}
                    type="button"
                    aria-label="Toggle fly mode"
                    title="Toggle fly mode"
                    data-plurid-control="toolbar-button"
                    onClick={() => dispatchToggleConfigurationSpaceFirstPerson(undefined)}
                    active={firstPerson}
                    button={true}
                    showIcons={showIcons}
                    showTransformButtons={showTransformButtons}
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


                {/* {universesBased && (
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
                )} */}

                <StyledToolbarButton
                    ref={moreButton}
                    theme={theme}
                    type="button"
                    aria-label="More"
                    title="More"
                    aria-expanded={showMenu === MENUS.MORE}
                    aria-controls={menuID}
                    data-plurid-control="toolbar-more"
                    // `detail` is 0 for a click the keyboard made (Enter, Space)
                    onClick={(event: React.MouseEvent) => handleShowMenu(MENUS.MORE, event.detail === 0)}
                    active={showMenu === MENUS.MORE}
                    button={true}
                    showIcons={showIcons}
                    showTransformButtons={showTransformButtons}
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
                <MenuMore
                    menuID={menuID}
                />
            )}
        </StyledToolbar>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridToolbarStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    theme: selectors.themes.getInteractionTheme(state),
    viewSize: selectors.space.getViewSize(state),
    // universes: selectors.data.getUniverses(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridToolbarDispatchProperties => ({
    dispatchToggleConfigurationSpaceFirstPerson: () => dispatch(
        actions.configuration.toggleConfigurationSpaceFirstPerson(),
    ),

    dispatchSetConfigurationSpaceTransformMode: (
        mode,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformMode(mode)
    ),
});


const ConnectedPluridToolbar = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridToolbar);
// #endregion module



// #region exports
export default ConnectedPluridToolbar;
// #endregion exports
