// #region imports
    // #region libraries
    import React, {
        useRef,
        useEffect,
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
        TOOLBAR_DRAWERS,

        PluridConfiguration,
        InternationalizationLanguageType,
    } from '@plurid/plurid-data';

    import {
        internatiolate,
    } from '@plurid/plurid-engine';

    import {
        useDebouncedCallback,
    } from '@plurid/plurid-functions-react';
    // #endregion libraries


    // #region external
    import PluridDrawer from '../Drawer';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchAction,
    } from '~data/interfaces';
    // #endregion external


    // #region internal
    import {
        StyledPluridMoreMenu,
        StyledPluridMoreMenuScroll,
    } from './styled';

    import {
        MoreMenu,
        moreMenus,
        moreMenusRecord,
    } from './data';
    // #endregion internal
// #endregion imports



// #region module
export const resolveMenus = (
    drawers: (keyof typeof TOOLBAR_DRAWERS)[],
) => {
    if (drawers.length === 0 || drawers.includes('ALL')) {
        return moreMenus;
    }

    const resolvedMenus: MoreMenu[] = [];

    for (const drawer of drawers) {
        const menu = moreMenusRecord[drawer];
        resolvedMenus.push(menu);
    }

    return resolvedMenus;
}


export interface PluridMoreMenuOwnProperties {
}

export interface PluridMoreMenuStateProperties {
    stateLanguage: InternationalizationLanguageType;
    stateInteractionTheme: Theme;
    stateConfiguration: PluridConfiguration;
    stateToolbarMenuScrollPosition: number;
}

export interface PluridMoreMenuDispatchProperties {
    dispatchToggleConfigurationToolbarToggleDrawer: DispatchAction<typeof actions.configuration.toggleConfigurationToolbarToggleDrawer>;
    dispatchSetUIToolbarScrollPosition: DispatchAction<typeof actions.ui.setUIToolbarScrollPosition>;
}

export type PluridMoreMenuProperties = PluridMoreMenuOwnProperties
    & PluridMoreMenuStateProperties
    & PluridMoreMenuDispatchProperties;


const PluridMoreMenu: React.FC<PluridMoreMenuProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateLanguage,
        stateInteractionTheme,
        stateConfiguration,
        stateToolbarMenuScrollPosition,
        // #endregion state

        // #region dispatch
        dispatchToggleConfigurationToolbarToggleDrawer,
        dispatchSetUIToolbarScrollPosition,
        // #endregion dispatch
    } = properties;

    const {
        global,
        elements,
    } = stateConfiguration;

    const {
        transparentUI,
    } = global;

    const {
        toolbar,
    } = elements;

    const {
        drawers,
        toggledDrawers,
    } = toolbar;

    const menus = resolveMenus(drawers);
    // #endregion properties


    // #region references
    const moreMenuScrollElement = useRef<HTMLDivElement>(null);
    // #endregion references


    // #region handlers
    const handleWheel = useDebouncedCallback((_event: WheelEvent) => {
        if (moreMenuScrollElement.current) {
            const scrollPosition = moreMenuScrollElement.current.scrollTop;
            dispatchSetUIToolbarScrollPosition(scrollPosition);
        }
    }, 100);
    // #endregion handlers


    // #region effects
    /** Wheel listener */
    useEffect(() => {
        if (moreMenuScrollElement.current) {
            moreMenuScrollElement.current.addEventListener('wheel', handleWheel);
        }

        return () => {
            if (moreMenuScrollElement.current) {
                moreMenuScrollElement.current.removeEventListener('wheel', handleWheel);
            }
        }
    }, [
        moreMenuScrollElement.current,
    ]);

    /** Set scrollTop */
    useEffect(() => {
        if (moreMenuScrollElement.current) {
            moreMenuScrollElement.current.scrollTop = stateToolbarMenuScrollPosition;
        }
    }, [
        stateToolbarMenuScrollPosition,
        moreMenuScrollElement.current,
    ]);
    // #endregion effects


    // #region render
    return (
        <StyledPluridMoreMenu
            theme={stateInteractionTheme}
            transparentUI={transparentUI}
        >
            <StyledPluridMoreMenuScroll
                ref={moreMenuScrollElement}
            >
                {menus.map(moreMenu => {
                    const {
                        name,
                        drawer,
                        component,
                    } = moreMenu;

                    const internationalizedName = internatiolate(stateLanguage, name);

                    return (
                        <PluridDrawer
                            key={name}
                            heading={internationalizedName}
                            items={(
                                <>{component}</>
                            )}
                            toggled={toggledDrawers.includes('ALL') || toggledDrawers.includes(drawer)}
                            toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(drawer as TOOLBAR_DRAWERS)}
                        />
                    )
                })}
            </StyledPluridMoreMenuScroll>
        </StyledPluridMoreMenu>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridMoreMenuStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateToolbarMenuScrollPosition: selectors.ui.getToolbarScrollPosition(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMoreMenuDispatchProperties => ({
    dispatchToggleConfigurationToolbarToggleDrawer: (
        drawer,
    ) => dispatch(
        actions.configuration.toggleConfigurationToolbarToggleDrawer(drawer),
    ),
    dispatchSetUIToolbarScrollPosition: (
        value,
    ) => dispatch(
        actions.ui.setUIToolbarScrollPosition(value),
    ),
});


const ConnectedPluridMoreMenu = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridMoreMenu);
// #endregion module



// #region exports
export default ConnectedPluridMoreMenu;
// #endregion exports
