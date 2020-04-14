import React, {
    useRef,
    useState,
    useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import themes from '@plurid/plurid-themes';

import {
    general as generalEngine,
} from '@plurid/plurid-engine';

import {
    StyledPluridPlaneConfigurator,
} from './styled';

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


/**
 * Goes up the tree to find the first plurid plane
 * and update it's properties.
 *
 * @param properties
 */
const PluridPlaneConfigurator: React.FC<PluridPlaneConfiguratorPropertiesWithChildren> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        theme,

        /** state */

        /** dispatch */
    } = properties;


    /** references */
    const configuratorElement: React.RefObject<HTMLDivElement> = useRef(null);


    /** state */
    const [planePlaneID, setParentPlaneID] = useState('');


    /** effects */
    /**
     * Get Parent Plane ID
     * Get Plurid Link Coordinates
     */
    useEffect(() => {
        const parentPlaneID = generalEngine.plane.getPluridPlaneIDByData(
            configuratorElement.current,
        );
        setParentPlaneID(parentPlaneID);
    }, []);


    console.log('planePlaneID', planePlaneID);


    /** render */
    return (
        <StyledPluridPlaneConfigurator
            ref={configuratorElement}
            data-plurid-entity="PlaneConfigurator"
        />
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
