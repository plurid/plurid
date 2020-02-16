import PluridPubSub from '@plurid/plurid-pubsub';

import {
    PluridPage,
    PluridPageContext,
} from './page';
import {
    PluridDocument,
} from './document';
import {
    PluridConfiguration
} from './configuration';

import {
    RecursivePartial,
} from '../helpers';



export interface PluridApp {
    /**
     * A `PluridApp` must be either pages or documents based.
     */
    pages?: PluridPage[],

    /**
     * Optional context for the page to have access to.
     */
    pageContext?: PluridPageContext<any>,

    /**
     * Optional context initial value.
     */
    pageContextValue?: any,

    /**
     * Paths of the pages in view on the initial rendering
     */
    view?: string[],

    /**
     * A `PluridApp` must be either pages or documents based.
     *
     * A `PluridDocument` is a collection of PluridPages (`PluridPage[]`).
     */
    documents?: PluridDocument[],

    configuration?: RecursivePartial<PluridConfiguration>,

    pubsub?: PluridPubSub,
}
