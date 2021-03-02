// #region imports
    // #region libraries
    import {
        indexing,
    } from '@plurid/plurid-functions';

    import {
        Indexed,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface TwithID {
    id: string;
    [key: string]: any;
}

export const createIndexed = <T extends TwithID>(
    items: T[],
): Indexed<T> => {
    return indexing.create(items);

    // const indexedItems = {};

    // for (let item of items) {
    //     indexedItems[item.id] = item;
    // }

    // return indexedItems;
}
// #endregion module
