// #region imports
    // #region external
    import {
        PluridPlane,
    } from '../plane';
    // #endregion external
// #endregion imports



// #region module
export interface PluridUniverse<C> {
    value: string;

    planes?: PluridPlane<C>[];

    view?: string[];

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
}
// #endregion module
