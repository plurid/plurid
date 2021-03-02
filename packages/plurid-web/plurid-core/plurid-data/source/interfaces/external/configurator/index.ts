// #region imports
    // #region libraries
    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries
// #endregion imports



// #region module
export interface PluridApplicationConfiguratorProperties {
    /**
     * Publish/Subscribe bus based on `@plurid/plurid-pubsub`.
     */
    pubsub?: PluridPubSub;
}


export interface PluridPlaneConfiguratorProperties {
    theme: string;
    style: React.CSSProperties;
}
// #endregion module
