import PluridPubSub from '@plurid/plurid-pubsub';

import {
    PluridPage,
    PluridPageContext,
    PluridPageContextValue,
    PluridView,
    PluridCluster,
} from './page';

import {
    PluridDocument,
} from './document';

import {
    PluridPartialConfiguration,
} from './configuration';



export interface PluridApp {
    /**
     * A `PluridApp` must be either pages or documents based.
     */
    pages?: PluridPage[];

    /**
     * Optional context for the page to have access to.
     */
    pageContext?: PluridPageContext<any>;

    /**
     * Optional context initial value.
     */
    pageContextValue?: PluridPageContextValue;

    /**
     * Paths to the pages in view on the initial rendering.
     */
    view?: string[] | PluridView[];

    /**
     * A cluster ensures the rendering of all the pages that it contains
     * in the same space zone.
     */
    clusters?: PluridCluster[];

    /**
     * A `PluridApp` must be either pages or documents based.
     *
     * A `PluridDocument` is a collection of PluridPages (`PluridPage[]`).
     */
    documents?: PluridDocument[];

    configuration?: PluridPartialConfiguration;

    pubsub?: PluridPubSub;
}
