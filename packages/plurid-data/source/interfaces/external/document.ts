import {
    PluridPage,
    PluridView,
    PluridCluster,
} from './page';



export interface PluridDocument {
    /**
     * Optional, application-wide unique identifier.
     */
    id?: string;

    /**
     * Must be unique if IDs not provided.
     */
    name: string;

    pages: PluridPage[];

    /**
     * By default, the order the documents are shown in is based on their index in the `documents[]`.
     * The ordinal can be used to overrule the default order.
     * If not unique, the documents with equal `ordinal` will be ordered by index.
     *
     * 0-based.
     */
    ordinal?: number;

    /**
     * Set the document as active. By default the first document is active.
     *
     * Only one document can be active at a time.
     */
    active?: boolean;

    /**
     * Paths to the pages in view on the initial rendering.
     */
    view?: string[] | PluridView[];

    /**
     * A cluster ensures the rendering of all the pages that it contains
     * in the same space zone.
     */
    clusters?: PluridCluster[];
}
