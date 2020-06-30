import React, {
    useRef,
    useContext,
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import PluridPubSub from '@plurid/plurid-pubsub';

import {
    PLURID_ENTITY_APPLICATION_CONFIGURATOR,
    PluridConfiguration,
    PluridPartialConfiguration,
} from '@plurid/plurid-data';

import {
    general as generalEngine,
} from '@plurid/plurid-engine';

import {
    StyledPluridApplicationConfigurator,
} from './styled';

import Context from '../../services/logic/context';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
// import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



export interface PluridApplicationConfiguratorOwnProperties {
    configuration?: PluridPartialConfiguration;
    pubsub?: PluridPubSub;
}

export interface PluridApplicationConfiguratorStateProperties {
}

export interface PluridApplicationConfiguratorDispatchProperties {
    dispatchSetConfiguration: typeof actions.configuration.setConfiguration;
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
        dispatchSetConfiguration,
    } = properties;


    /** references */
    const configuratorElement: React.RefObject<HTMLDivElement> = useRef(null);


    /** effects */
    /**
     *
     */
    useEffect(() => {
        const computedConfiguration = generalEngine.configuration.merge(configuration);
        dispatchSetConfiguration(computedConfiguration);
    }, [
        configuration,
    ]);

    /**
     * Handle Publish/Subscribe.
     */
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
    dispatchSetConfiguration: (
        configuration: PluridConfiguration,
    ) => dispatch(
        actions.configuration.setConfiguration(configuration)
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridApplicationConfigurator);
