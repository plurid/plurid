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
    space: any;
}

interface PluridSpaceDispatchProperties {
}

type PluridSpaceProperties = PluridSpaceOwnProperties
    & PluridSpaceStateProperties
    & PluridSpaceDispatchProperties;

const PluridSpace: React.FC<PluridSpaceProperties> = (properties) => {
    const {
        generalTheme,
        transparent,
        showToolbar,
        space,
    } = properties;

    console.log('space', space);

    return (
        <StyledPluridSpace
            theme={generalTheme}
            transparent={transparent}
        >
            <PluridRoots />

            {showToolbar && (
                <ToolbarGeneral />
            )}
        </StyledPluridSpace>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridSpaceStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    transparent: selectors.configuration.getConfiguration(state).space.transparent,
    showToolbar: selectors.configuration.getConfiguration(state).toolbar,
    space: state.space,
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
