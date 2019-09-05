import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/apps.utilities.themes';

import {
    StyledPluridSpace,
} from './styled';

import PluridRoots from '../PluridRoots';

import { AppState } from '../../services/state/store';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface PluridSpaceOwnProperties {
}

interface PluridSpaceStateProperties {
    generalTheme: Theme;
}

interface PluridSpaceDispatchProperties {
}

type PluridSpaceProperties = PluridSpaceOwnProperties
    & PluridSpaceStateProperties
    & PluridSpaceDispatchProperties;

const PluridSpace: React.FC<PluridSpaceProperties> = (properties) => {
    const {
        generalTheme,
    } = properties;

    return (
        <StyledPluridSpace
            theme={generalTheme}
        >
            <PluridRoots />
        </StyledPluridSpace>
    );
}


const mapStateToProps = (state: AppState): PluridSpaceStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridSpaceDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PluridSpace);
