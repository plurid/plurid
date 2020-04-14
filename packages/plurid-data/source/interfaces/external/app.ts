import PluridPubSub from '@plurid/plurid-pubsub';

import {
    PluridPlane,
    PluridPlaneContext,
    PluridComponent,
} from './plane';

import {
    PluridCluster,
} from './cluster';

import {
    PluridUniverse,
} from './universe';

import {
    PluridView,
} from './view';

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
    planeContextValue?: Record<string, any>;

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
     * Controlled origins.
     * Defaults to the one serving the application.
     */
    origins?: string[];

    /**
     * Origins which the plurid links can access.
     * Default `controlled`.
     */
    allowedOrigins?: 'controlled' | 'all';

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
