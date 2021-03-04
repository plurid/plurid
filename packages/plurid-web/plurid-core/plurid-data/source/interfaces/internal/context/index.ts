// #region imports
    // #region libraries
    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries


    // #region external
    import {
        PluridPlaneContext,
    } from '../../external';

    import {
        PluridPlanesRegistrar,
    } from '../../external/registrar';
    // #endregion external
// #endregion imports



// #region module
export interface PluridContext {
    planesRegistrar?: PluridPlanesRegistrar;
    planeContext?: PluridPlaneContext<any>;
    planeContextValue?: any;

    registerPubSub: (
        pubsub: PluridPubSub,
    ) => void;
}
// #endregion module
