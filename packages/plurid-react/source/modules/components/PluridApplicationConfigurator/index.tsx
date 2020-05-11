import React, {
    useRef,
    useState,
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PLURID_ENTITY_APPLICATION_CONFIGURATOR,
} from '@plurid/plurid-data';

import {
    StyledPluridApplicationConfigurator,
} from './styled';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
// import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface PluridApplicationConfiguratorOwnProperties {
}

interface PluridApplicationConfiguratorStateProperties {
}

interface PluridApplicationConfiguratorDispatchProperties {
}

type PluridApplicationConfiguratorProperties = PluridApplicationConfiguratorOwnProperties
    & PluridApplicationConfiguratorStateProperties
    & PluridApplicationConfiguratorDispatchProperties;


/**
 * Goes up the tree to find the first plurid application
 * and update it's properties.
 *
 * @param properties
 */
const PluridApplicationConfigurator: React.FC<React.PropsWithChildren<PluridApplicationConfiguratorProperties>> = (
    properties,
) => {
    /** properties */
    // const {
    //     /** own */

    //     /** state */

    //     /** dispatch */
    // } = properties;


    /** references */
    const configuratorElement: React.RefObject<HTMLDivElement> = useRef(null);


    /** state */
    const [applicationID, setApplicationID] = useState('');


    /** effects */
    /**
     * Get applicationID
     */
    useEffect(() => {

    }, []);


    /** render */
    return (
        <StyledPluridApplicationConfigurator
            ref={configuratorElement}
            data-plurid-entity={PLURID_ENTITY_APPLICATION_CONFIGURATOR}
        />
    );
}


const mapStateToProps = (
    state: AppState,
): PluridApplicationConfiguratorStateProperties => ({

});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridApplicationConfiguratorDispatchProperties => ({

});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridApplicationConfigurator);
