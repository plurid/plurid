import React from 'react';

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
}

interface PluridSpaceStateProperties {
    configuration: PluridConfiguration,
    generalTheme: Theme;
}

interface PluridSpaceDispatchProperties {
}

type PluridSpaceProperties = PluridSpaceOwnProperties
    & PluridSpaceStateProperties
    & PluridSpaceDispatchProperties;

const PluridSpace: React.FC<PluridSpaceProperties> = (properties) => {
    const {
        /** state */
        configuration,
        generalTheme,
    } = properties;

    const {
        elements,
        space,
    } = configuration;

    const {
        toolbar,
        viewcube,
    } = elements;

    const opaqueSpace = space.opaque;
    const showToolbar = toolbar.show;
    const showViewcube = viewcube.show;

    return (
        <StyledPluridSpace
            theme={generalTheme}
            opaque={opaqueSpace}
            data-plurid-entity={PLURID_ENTITY_SPACE}
        >
            <PluridRoots />

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
    configuration: selectors.configuration.getConfiguration(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
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
