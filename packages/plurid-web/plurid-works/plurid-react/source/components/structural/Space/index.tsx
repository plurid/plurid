// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import {
        connect,
        ReactReduxContext,
    } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,
        PLURID_ENTITY_SPACE,
    } from '@plurid/plurid-data';
    import { useContext as useReactContext } from 'react';
    // #endregion libraries


    // #region external
    import PluridRoots from '../Roots';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import {
        buildInspection,
    } from '~services/logic/inspector';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    /** The HUD, loaded only when `development.spaceDebugger` asks for it (never in a production bundle's main chunk). */
    const PluridSpaceDebugger = React.lazy(() => import('./components/SpaceDebugger'));
    import {
        StyledPluridSpace,
    } from './styled';
    // #endregion internal
    import Context from '~services/context';
// #endregion imports



// #region module
export interface PluridSpaceOwnProperties {
}

export interface PluridSpaceStateProperties {
    stateConfiguration: PluridConfiguration,
    stateGeneralTheme: Theme;
    stateResolvedLayout: boolean;
}

export interface PluridSpaceDispatchProperties {
}

export type PluridSpaceProperties =
    & PluridSpaceOwnProperties
    & PluridSpaceStateProperties
    & PluridSpaceDispatchProperties;


const PluridSpace: React.FC<PluridSpaceProperties> = (
    properties,
) => {
    const reduxContext = React.useContext(StateContext as unknown as typeof ReactReduxContext);
    const pluridContext = useReactContext(Context);
    // #region properties
    const {
        // #region state
        stateConfiguration,
        stateGeneralTheme,
        stateResolvedLayout,
        // #endregion state
    } = properties;

    const {
        space,
    } = stateConfiguration;

    const {
        opaque,
        fadeInTime,
        perspective,
    } = space;
    // #endregion properties


    // #region state
    const [
        isMounted,
        setIsMounted,
    ] = useState(false);
    // #endregion state


    // #region effects
    useEffect(() => {
        setIsMounted(true);
    }, []);
    // #endregion effects


    // #region render
    return (
        <StyledPluridSpace
            theme={stateGeneralTheme}
            opaque={opaque}
            isMounted={isMounted}
            fadeInTime={fadeInTime}
            perspective={perspective || 2000}
            data-plurid-entity={PLURID_ENTITY_SPACE}
            style={{
                opacity: stateResolvedLayout ? 1 : 0
            }}
        >
            <PluridRoots />

            {stateConfiguration.development?.spaceDebugger && typeof window !== 'undefined' && (
                // never on the server: a lazy chunk would stall a streamed render
                pluridContext?.chrome?.renderDebugger
                    ? pluridContext.chrome.renderDebugger(
                        reduxContext?.store ? buildInspection(reduxContext.store.getState() as AppState, pluridContext.inspector) : undefined,
                    ) as React.ReactNode
                    : (
                        <React.Suspense fallback={null}>
                            <PluridSpaceDebugger inspector={pluridContext?.inspector} />
                        </React.Suspense>
                    )
            )}
        </StyledPluridSpace>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridSpaceStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateResolvedLayout: selectors.space.getResolvedLayout(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridSpaceDispatchProperties => ({
});


const ConnectedPluridSpace = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridSpace);
// #endregion module



// #region exports
export default ConnectedPluridSpace;
// #endregion exports
