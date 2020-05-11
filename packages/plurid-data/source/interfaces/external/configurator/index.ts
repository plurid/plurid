import PluridPubSub from '@plurid/plurid-pubsub';



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
