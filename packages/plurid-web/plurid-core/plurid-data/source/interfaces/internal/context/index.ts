// #region imports
    // #region libraries
    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries


    // #region external
    import {
        PluridPlaneContext,
    } from '../../external';

    import {
        RegisteredPluridPlane,
    } from '../../external/plane';
    // #endregion external
// #endregion imports



// #region module
export interface PluridContext {
    planesRegistry: Map<string, RegisteredPluridPlane>;
    planeContext?: PluridPlaneContext<any>;
    planeContextValue?: any;

    registerPubSub: (
        pubsub: PluridPubSub,
    ) => void;
}
// #endregion module
