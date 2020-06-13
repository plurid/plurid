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
    PluridPartialConfiguration,
} from '@plurid/plurid-data';

import {
    StyledPluridApplicationConfigurator,
} from './styled';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
// import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridApplicationConfiguratorOwnProperties {
    configuration?: PluridPartialConfiguration;
}

export interface PluridApplicationConfiguratorStateProperties {
}

export interface PluridApplicationConfiguratorDispatchProperties {
}

export type PluridApplicationConfiguratorProperties = PluridApplicationConfiguratorOwnProperties
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
    const {
        /** own */
        configuration,

        /** state */

        /** dispatch */
    } = properties;


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
