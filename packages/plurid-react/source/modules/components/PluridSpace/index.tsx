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

import PluridRoots from '../PluridRoots';

import ToolbarGeneral from '../Toolbar/General';
import Viewcube from '../Viewcube';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface PluridSpaceOwnProperties {
    computedTree?: any;
    indexedPlanesReference?: any;
    planesPropertiesReference?: any;
    appConfiguration?: any;
}

interface PluridSpaceStateProperties {
    stateConfiguration: PluridConfiguration,
    stateGeneralTheme: Theme;
}

interface PluridSpaceDispatchProperties {
}

type PluridSpaceProperties = PluridSpaceOwnProperties
    & PluridSpaceStateProperties
    & PluridSpaceDispatchProperties;


const PluridSpace: React.FC<PluridSpaceProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        computedTree,
        indexedPlanesReference,
        planesPropertiesReference,
        appConfiguration,

        /** state */
        stateConfiguration,
        stateGeneralTheme,
    } = properties;

    const activeConfiguration = computedTree
        ? appConfiguration
        : stateConfiguration;

    const {
        elements,
        space,
    } = activeConfiguration;

    const {
        toolbar,
        viewcube,
    } = elements;

    const opaqueSpace = space.opaque;
    const showToolbar = toolbar.show;
    const showViewcube = viewcube.show;


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
            {typeof computedTree === 'undefined' && (
                <PluridRoots />
            )}

            {typeof computedTree !== 'undefined' && (
                <PluridRoots
                    computedTree={computedTree}
                    indexedPlanesReference={indexedPlanesReference}
                    planesPropertiesReference={planesPropertiesReference}
                    appConfiguration={appConfiguration}
                />
            )}

            {showToolbar && (
                <ToolbarGeneral />
            )}

            {showViewcube && (
                <Viewcube />
            )}
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
