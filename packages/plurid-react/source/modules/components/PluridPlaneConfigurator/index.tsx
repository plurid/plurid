import React, {
    // useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import themes from '@plurid/plurid-themes';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
// import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface PluridPlaneConfiguratorOwnProperties {
    theme: keyof typeof themes;
}

interface PluridPlaneConfiguratorStateProperties {
}

interface PluridPlaneConfiguratorDispatchProperties {
}

type PluridPlaneConfiguratorProperties = PluridPlaneConfiguratorOwnProperties
    & PluridPlaneConfiguratorStateProperties
    & PluridPlaneConfiguratorDispatchProperties;

type PluridPlaneConfiguratorPropertiesWithChildren = React.PropsWithChildren<PluridPlaneConfiguratorProperties>;

const PluridPlaneConfigurator: React.FC<PluridPlaneConfiguratorPropertiesWithChildren> = (
    properties,
) => {
    const {
        /** own */
        theme,

        /** state */

        /** dispatch */
    } = properties;

    // go up the tree and find the first plurid plane
    // listen for changes on the properties
    // update the plane properties

    return (
        <div>

        </div>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridPlaneConfiguratorStateProperties => ({

});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneConfiguratorDispatchProperties => ({

});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneConfigurator);
