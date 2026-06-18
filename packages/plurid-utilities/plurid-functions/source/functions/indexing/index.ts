// #region imports
    // #region external
    import {
        Indexed,
    } from '~data/interfaces';

    import * as uuid from '~functions/uuid';
    // #endregion external
// #endregion imports



// #region module
/**
 * Identify `items` by an `idEntity` property.
 *
 * @param items
 * @param idEntity
 */
export const identify = <T>(
    items: T[],
    /**
     * Identify items by a certain property. Default `id`.
     */
    idEntity?: string,
) => {
    const idProperty = idEntity || 'id';

    type Identified = {
        [property in typeof idProperty]: string;
    }
    type IdentifiedT = T & Identified;


    const identifiedItems = items.map(item => {
        const idValue: string = (item as Record<string, any>)[idProperty] || uuid.generate();

        const identifiedItem = {
            ...item,
        };
        (identifiedItem as Record<string, any>)[idProperty] = idValue;

        return identifiedItem as IdentifiedT;
    });

    return identifiedItems;
}



export type MapType = 'map';
export type ObjectType = 'object';
export type CreateType = MapType | ObjectType;

export function create<T, O extends ObjectType>(items: T[], type?: O, idKey?: string): Indexed<T>;
export function create<T, M extends MapType>(items: T[], type?: M, idKey?: string): Map<string, T>;
export function create<T, C extends CreateType>(items: T[], type?: C, idKey?: string)  {
    const id = idKey || 'id';
    const typeProperty = type || 'object';

    switch (typeProperty) {
        case 'map':
            {
                const mappedItems = new Map<string, T>();

                items.map(item => {
                    const idValue: string = (item as Record<string, any>)[id] || uuid.generate();
                    mappedItems.set(idValue, item);
                });

                return mappedItems;
            }
        case 'object':
            {
                const indexedItems: Indexed<T> = {};

                for (const item of items) {
                    const itemID: string | undefined = (item as Record<string, any>)[id];
                    if (!itemID) {
                        continue;
                    }
                    indexedItems[itemID] = item;
                }

                return indexedItems;
            }
    }

    return;
}
// #endregion module
