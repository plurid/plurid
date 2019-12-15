import {
    Indexed,
} from '@plurid/plurid-data';



interface TwithID {
    id: string;
    [key: string]: any;
}

export const createIndexed = <T extends TwithID>(
    items: T[],
): Indexed<T> => {
    const indexedItems = {};

    for (let item of items) {
        indexedItems[item.id] = item;
    }

    return indexedItems;
}
