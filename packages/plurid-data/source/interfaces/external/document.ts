import {
    PluridPage,
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
     */
    ordinal?: number;

    /**
     * Set the document as active. By default the first document is active.
     *
     * Only one document can be active at a time.
     */
    active?: boolean;
}
