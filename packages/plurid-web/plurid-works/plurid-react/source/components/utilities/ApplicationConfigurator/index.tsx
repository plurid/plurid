// #region imports
    // #region libraries
    import React, {
        useRef,
        useContext,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import PluridPubSub from '@plurid/plurid-pubsub';

    import {
        PLURID_ENTITY_APPLICATION_CONFIGURATOR,
        PluridConfiguration,
        PluridPartialConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import Context from '~services/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchAction,
    } from '~data/interfaces';

    import {
        generalEngine,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        StyledPluridApplicationConfigurator,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridApplicationConfiguratorOwnProperties {
    configuration?: PluridPartialConfiguration;
    pubsub?: PluridPubSub;
}

export interface PluridApplicationConfiguratorStateProperties {
    stateConfiguration: PluridConfiguration;
}

export interface PluridApplicationConfiguratorDispatchProperties {
    dispatchSetConfiguration: DispatchAction<typeof actions.configuration.setConfiguration>;
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
        stateConfiguration,

        /** dispatch */
        dispatchSetConfiguration,
    } = properties;


    /** references */
    const configuratorElement: React.RefObject<HTMLDivElement> = useRef(null);


    /** effects */
    /**
     * Handle configuration.
     */
    useEffect(() => {
        const computedConfiguration = generalEngine.configuration.merge(
            configuration,
            stateConfiguration,
        );
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
    stateConfiguration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridApplicationConfiguratorDispatchProperties => ({
    dispatchSetConfiguration: (
        payload,
    ) => dispatch(
        actions.configuration.setConfiguration(payload)
    ),
});


const ConnectedPluridApplicationConfigurator = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridApplicationConfigurator);
// #endregion module



// #region exports
export default ConnectedPluridApplicationConfigurator;
// #endregion exports
