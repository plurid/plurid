// #region imports
    // #region external
    import {
        PluridPlaneContext,
    } from '~interfaces/external/plane';

    import {
        PluridPlanesRegistrar,
    } from '~interfaces/external/registrar';

    import {
        PluridPubSub,
    } from '~interfaces/external/pubsub';
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
