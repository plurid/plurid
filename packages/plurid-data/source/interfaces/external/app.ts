import PluridPubSub from '@plurid/plurid-pubsub';

import {
    PluridPlane,
    PluridPlaneContext,
    PluridPlaneContextValue,
    PluridView,
    PluridCluster,
    PluridComponent,
} from './plane';

import {
    PluridUniverse,
} from './universe';

import {
    PluridPartialConfiguration,
} from './configuration';



export interface PluridApplication {
    /**
     * A `PluridApplication` must be either planes or universes based.
     */
    planes?: PluridPlane[];

    /**
     * Optional context for the plane to have access to.
     */
    planeContext?: PluridPlaneContext<any>;

    /**
     * Optional context initial value.
     */
    planeContextValue?: PluridPlaneContextValue;

    /**
     * Paths of the planes in view on the initial rendering.
     */
    view?: string[] | PluridView[];

    /**
     * A cluster ensures the rendering of all the planes that reference it
     * in the same space zone.
     */
    clusters?: PluridCluster[];

    /**
     * A `PluridApplication` must be either planes or universes based.
     *
     * A `PluridUniverse` is a collection of PluridPlanes (`PluridPlane[]`).
     */
    universes?: PluridUniverse[];

    /**
     * Show or not the default Not Found component, or pass a custom component
     */
    notFound?: boolean | PluridComponent;

    /**
     * Application-wide partial configuration.
     */
    configuration?: PluridPartialConfiguration;

    /**
     * Publish/Subscribe bus based on `@plurid/plurid-pubsub`.
     */
    pubsub?: PluridPubSub;

    serverData?: PluridServerData;
}


export interface PluridServerData {
    view: any[];
}
