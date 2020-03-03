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
    StyledMoreMenu,
    StyledMoreMenuScroll,
} from './styled';

import Drawer from '../Drawer';

import {
    moreMenus,
} from './data';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



interface MoreMenuOwnProperties {
}

interface MoreMenuStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    toolbarMenuScrollPosition: number;
}

interface MoreMenuDispatchProperties {
    dispatchToggleConfigurationToolbarToggleDrawer: typeof actions.configuration.toggleConfigurationToolbarToggleDrawer;
    dispatchSetUIToolbarScrollPosition: typeof actions.ui.setUIToolbarScrollPosition;
}

type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;

const MoreMenu: React.FC<MoreMenuProperties> = (properties) => {
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

    const moreMenuScrollElement = useRef<HTMLDivElement>(null);

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

    const handleWheel = useDebouncedCallback((event: WheelEvent) => {
        if (moreMenuScrollElement.current) {
            const scrollPosition = moreMenuScrollElement.current.scrollTop;
            dispatchSetUIToolbarScrollPosition(scrollPosition);
        }
    }, 100);

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

    return (
        <StyledMoreMenu
            theme={interactionTheme}
            transparentUI={transparentUI}
        >
            <StyledMoreMenuScroll
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
                        <Drawer
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
            </StyledMoreMenuScroll>
        </StyledMoreMenu>
    );
}


const mapStateToProps = (
    state: AppState,
): MoreMenuStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
    toolbarMenuScrollPosition: selectors.ui.getToolbarScrollPosition(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MoreMenuDispatchProperties => ({
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
)(MoreMenu);
