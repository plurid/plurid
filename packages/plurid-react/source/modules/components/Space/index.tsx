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

import {
    StyledPluridSpace,
} from './styled';

import PluridRoots from '../Roots';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



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
    /** properties */
    const {
        /** state */
        stateConfiguration,
        stateGeneralTheme,
    } = properties;

    const {
        space,
    } = stateConfiguration;

    const opaqueSpace = space.opaque;


    /** state */
    const [isMounted, setIsMounted] = useState(false);


    /** effects */
    useEffect(() => {
        setIsMounted(true);
    }, []);


    /** render */
    return (
        <StyledPluridSpace
            theme={stateGeneralTheme}
            opaque={opaqueSpace}
            data-plurid-entity={PLURID_ENTITY_SPACE}
            isMounted={isMounted}
        >
            <PluridRoots />
        </StyledPluridSpace>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridSpaceStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridSpaceDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridSpace);
