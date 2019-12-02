import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/plurid-themes';

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
    generalTheme: Theme;
    transparent: boolean | undefined;
    showToolbar: boolean | undefined;
}

interface PluridSpaceDispatchProperties {
}

type PluridSpaceProperties = PluridSpaceOwnProperties
    & PluridSpaceStateProperties
    & PluridSpaceDispatchProperties;

const PluridSpace: React.FC<PluridSpaceProperties> = (properties) => {
    const {
        /** state */
        generalTheme,
        transparent,
        showToolbar,
    } = properties;

    return (
        <StyledPluridSpace
            theme={generalTheme}
            transparent={transparent}
        >
            <PluridRoots />

            {showToolbar && (
                <ToolbarGeneral />
            )}

            <Viewcube />
        </StyledPluridSpace>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridSpaceStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    transparent: selectors.configuration.getConfiguration(state).space.transparent,
    showToolbar: selectors.configuration.getConfiguration(state).toolbar,
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
