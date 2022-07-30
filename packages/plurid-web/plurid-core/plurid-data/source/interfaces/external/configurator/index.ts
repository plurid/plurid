// #region imports
    // #region libraries
    import {
        PluridPubSub,
    } from '../pubsub';
    // #endregion libraries
// #endregion imports



// #region module
export interface PluridApplicationConfiguratorProperties {
    /**
     * Publish/Subscribe bus based on `@plurid/plurid-pubsub`.
     */
    pubsub?: PluridPubSub;
}


export interface PluridPlaneConfiguratorProperties<S> {
    theme: string;
    style: S;
}
// #endregion module
