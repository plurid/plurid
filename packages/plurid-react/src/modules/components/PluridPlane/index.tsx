import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridPlane,
} from './styled';

import PlaneControls from './components/PlaneControls';

import {
    PluridPage,
} from '../../data/interfaces';

import { AppState } from '../../services/state/store';
import { ViewSize } from '../../services/state/types/data';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



interface PluridPlaneOwnProperties {
    page: PluridPage,
    [key: string]: any;
}

interface PluridPlaneStateProperties {
    viewSize: ViewSize;
    spaceScale: number;
}

interface PluridPlaneDispatchProperties {

}

type PluridPlaneProperties = PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;

const PluridPlane: React.FC<PluridPlaneProperties> = (properties) => {
    const {
        page,
        children,
        viewSize,
        spaceScale,
    } = properties;

    return (
        <StyledPluridPlane
            viewSize={viewSize}
            spaceScale={spaceScale}
        >
            <PlaneControls
                page={page}
            />
            <br />
            {children}
            <br />
        </StyledPluridPlane>
    );
}


const mapStateToProps = (state: AppState): PluridPlaneStateProperties => ({
    viewSize: selectors.data.getViewSize(state),
    spaceScale: selectors.space.getScale(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridPlaneDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PluridPlane);
