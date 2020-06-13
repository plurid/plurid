import React, {
    useRef,
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

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

import {
    StyledPluridMoreMenu,
    StyledPluridMoreMenuScroll,
} from './styled';

import PluridDrawer from '../Drawer';

import {
    moreMenus,
} from './data';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



export interface PluridMoreMenuOwnProperties {
}

export interface PluridMoreMenuStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    toolbarMenuScrollPosition: number;
}

export interface PluridMoreMenuDispatchProperties {
    dispatchToggleConfigurationToolbarToggleDrawer: typeof actions.configuration.toggleConfigurationToolbarToggleDrawer;
    dispatchSetUIToolbarScrollPosition: typeof actions.ui.setUIToolbarScrollPosition;
}

export type PluridMoreMenuProperties = PluridMoreMenuOwnProperties
    & PluridMoreMenuStateProperties
    & PluridMoreMenuDispatchProperties;


const PluridMoreMenu: React.FC<PluridMoreMenuProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        interactionTheme,
        configuration,
        toolbarMenuScrollPosition,

        /** dispatch */
        dispatchToggleConfigurationToolbarToggleDrawer,
        dispatchSetUIToolbarScrollPosition,
    } = properties;

    const {
        transparentUI,
        elements,
    } = configuration;

    const {
        toolbar,
    } = elements;

    const {
        toggledDrawers,
    } = toolbar;


    /** references */
    const moreMenuScrollElement = useRef<HTMLDivElement>(null);


    /** handlers */
    const handleWheel = useDebouncedCallback((event: WheelEvent) => {
        if (moreMenuScrollElement.current) {
            const scrollPosition = moreMenuScrollElement.current.scrollTop;
            dispatchSetUIToolbarScrollPosition(scrollPosition);
        }
    }, 100);


    /** effects */
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

    useEffect(() => {
        if (moreMenuScrollElement.current) {
            moreMenuScrollElement.current.scrollTop = toolbarMenuScrollPosition;
        }
    }, [
        toolbarMenuScrollPosition,
        moreMenuScrollElement.current,
    ]);


    /** render */
    return (
        <StyledPluridMoreMenu
            theme={interactionTheme}
            transparentUI={transparentUI}
        >
            <StyledPluridMoreMenuScroll
                ref={moreMenuScrollElement}
            >
                {moreMenus.map(moreMenu => {
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
                            toggled={toggledDrawers.includes(drawer)}
                            toggle={() => dispatchToggleConfigurationToolbarToggleDrawer(drawer)}
                        />
                    )
                })}
            </StyledPluridMoreMenuScroll>
        </StyledPluridMoreMenu>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMoreMenuStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
    toolbarMenuScrollPosition: selectors.ui.getToolbarScrollPosition(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMoreMenuDispatchProperties => ({
    dispatchToggleConfigurationToolbarToggleDrawer: (
        drawer: keyof typeof TOOLBAR_DRAWERS,
    ) => dispatch(
        actions.configuration.toggleConfigurationToolbarToggleDrawer(drawer),
    ),
    dispatchSetUIToolbarScrollPosition: (
        value: number,
    ) => dispatch(
        actions.ui.setUIToolbarScrollPosition(value),
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMoreMenu);
