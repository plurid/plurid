// #region imports
    // #region libraries
    import React, {
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
        PLURID_ENTITY_SPACE,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import PluridRoots from '../Roots';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridSpace,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridSpaceOwnProperties {
    computedTree?: any;
    indexedPlanesReference?: any;
    planesPropertiesReference?: any;
    appConfiguration?: any;
}

export interface PluridSpaceStateProperties {
    stateConfiguration: PluridConfiguration,
    stateGeneralTheme: Theme;
}

export interface PluridSpaceDispatchProperties {
}

export type PluridSpaceProperties = PluridSpaceOwnProperties
    & PluridSpaceStateProperties
    & PluridSpaceDispatchProperties;


const PluridSpace: React.FC<PluridSpaceProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** state */
        stateConfiguration,
        stateGeneralTheme,
    } = properties;

    const {
        space,
    } = stateConfiguration;

    const opaqueSpace = space.opaque;
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
            data-plurid-entity={PLURID_ENTITY_SPACE}
            theme={stateGeneralTheme}
            opaque={opaqueSpace}
            isMounted={isMounted}
            fadeInTime={1200}
        >
            <PluridRoots />
        </StyledPluridSpace>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridSpaceStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
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
