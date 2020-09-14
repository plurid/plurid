import React from 'react';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import PluridSpace from '../../components/Space';
import PluridToolbar from '../../components/Toolbar/General';
import PluridViewcube from '../../components/Viewcube';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridPlanesViewOwnProperties {
}

export interface PluridPlanesViewStateProperties {
    stateConfiguration: PluridConfiguration,
}

export interface PluridPlanesViewDispatchProperties {
}

export type PluridPlanesViewProperties = PluridPlanesViewOwnProperties
    & PluridPlanesViewStateProperties
    & PluridPlanesViewDispatchProperties;


const PluridPlanesView: React.FC<PluridPlanesViewProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateConfiguration,
    } = properties;

    const {
        elements,
    } = stateConfiguration;

    const {
        toolbar,
        viewcube,
    } = elements;

    const showToolbar = toolbar.show;
    const showViewcube = viewcube.show;


    /** render */
    return (
        <>
            <PluridSpace />

            {showToolbar && (
                <PluridToolbar />
            )}

            {showViewcube && (
                <PluridViewcube />
            )}
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridPlanesViewStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlanesViewDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlanesView);
