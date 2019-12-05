import {
    Indexed,
} from '@plurid/plurid-data';



export const createIndexed = <T>(
    items: T[],
): Indexed<T> => {
    const indexedItems = {};

    for (let item of items) {
        indexedItems[(item as any).id] = item;
    }

    return indexedItems;
}
