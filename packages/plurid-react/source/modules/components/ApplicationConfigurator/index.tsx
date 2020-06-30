import React, {
    useRef,
    useContext,
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

import PluridPubSub from '@plurid/plurid-pubsub';

import {
    StyledPluridApplicationConfigurator,
} from './styled';

import Context from '../../services/logic/context';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
// import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridApplicationConfiguratorOwnProperties {
    configuration?: PluridPartialConfiguration;
    pubsub?: PluridPubSub;
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
    /** context */
    const context = useContext(Context);

    if (!context) {
        return (<></>);
    }

    const {
        registerPubSub,
    } = context;


    /** properties */
    const {
        /** own */
        configuration,
        pubsub,

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
    // useEffect(() => {

    // }, []);

    useEffect(() => {
        if (pubsub) {
            registerPubSub(pubsub);
        }
    }, [
        pubsub,
    ]);


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
