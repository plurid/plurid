// #region imports
    // #region external
    import {
        InvertResult,
        RecursivePartial,
        NestedKeyOf,
        RecursiveOmit,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const isObject = (
    entity: any,
) => {
    if (
        typeof entity === 'object'
        && !Array.isArray(entity)
        && entity !== null
    ) {
        return true;
    }

    return false;
}



/**
 * http://blog.nicohaemhouts.com/2015/08/03/accessing-nested-javascript-objects-with-string-key/
 *
 * @param data
 * @param path
 * @param separator
 */
export const getNested = <T>(
    data: T,
    path: string,
    separator: string = '.',
) => {
    try {
        return path.
            replace('[', separator).replace(']','').
            split(separator).
            reduce(
                (obj: any, property: string) => {
                    return obj[property];
                },
                data,
            );
    } catch (err) {
        return undefined;
    }
}


/**
 * https://stackoverflow.com/a/52912610
 *
 * @param data
 * @param update
 * @param path
 * @param separator
*/
export const updateNested = <T, U>(
   data: T,
   path: string,
   update: U,
   separator: string = '.',
): T | undefined => {
    try {
        const split = path.split(separator);

        let current = data;

        while (split.length > 1) {
            const part = split.shift();

            if (!part) {
                return;
            }

            const parent = current;
            current = (current as any)[part];

            if (undefined === current) {
                (parent as any)[part] = {};
                current = (parent as any)[part];
            }
        }

        if (split.length === 1) {
            const part = split.shift();
            if (!part) {
                return;
            }
            (current as any)[part] = update;
        }

        return data;
    } catch (err) {
        return;
    }
}


/**
 * https://stackoverflow.com/a/40294058/6639124
 *
 * @param obj
 * @param hash
 */
const deepClone = (
    obj: any,
    hash = new WeakMap(),
): any => {
    if (Object(obj) !== obj) return obj; // primitives

    if (hash.has(obj)) return hash.get(obj); // cyclic reference

    const result = obj instanceof Set ? new Set(obj) // See note about this!
                 : obj instanceof Map ? new Map(Array.from(obj, ([key, val]) =>
                                        [key, deepClone(val, hash)]))
                 : obj instanceof Date ? new Date(obj)
                 : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
                 // ... add here any specific treatment for other classes ...
                 // and finally a catch-all:
                 : obj.constructor ? new obj.constructor()
                 : Object.create(null);

    hash.set(obj, result);

    return Object.assign(
        result,
        ...Object.keys(obj).map(
            key => ({ [key]: deepClone(obj[key], hash) })
        ),
    );
}


/**
 * Creates a deep clone of the `data`.
 *
 * The default `type` is `json`, meant for deep cloning of json-like objects.
 * The `any` `type` will handle a deep clone of `Function`, `Date`, and more.
 *
 * @param data
 * @param type
 */
export const clone = <D>(
    data: D,
    type?: 'json' | 'any',
): D => {
    // Explicit 'json' keeps the fast path for plain JSON-like data, but falls back to the
    // cycle-safe deep clone on cyclic input — `JSON.stringify` THROWS on cycles, and
    // `JSON.parse(JSON.stringify(undefined))` throws ("undefined is not valid JSON").
    if (type === 'json') {
        try {
            return JSON.parse(
                JSON.stringify(data),
            );
        } catch (_error) {
            return deepClone(data);
        }
    }

    // Default (+ 'any'): cycle-safe deep clone. `deepClone` guards primitives/null/undefined,
    // handles Date/Map/Set/RegExp + cyclic references, and never throws — unlike the old
    // JSON default which silently dropped functions/undefined and crashed on cycles. This is
    // the per-tree-mutation hot path, so it must not throw.
    return deepClone(data);
}


/**
 * Convert map to object.
 *
 * @param map
 */
export const mapToObject = <K, V>(
    map: Map<K, V>,
) => {
    const obj: any = {};

    for (const [key, value] of map) {
        obj[key] = value;
    }

    return obj;
}


/**
 * Removes `undefined` or `null` values from key-value object.
 *
 * @param object
 * @returns
 */
export const clean = (
    object: Record<string, any | undefined | null>,
    onlyUndefined = false,
) => {
    const clonedObject = clone(object, 'any');

    for (const [key, value] of Object.entries(clonedObject)) {
        if (typeof value === 'undefined') {
            delete clonedObject[key];
        }

        if (!onlyUndefined) {
            if (value === null) {
                delete clonedObject[key];
            }
        }

        if (isObject(value)) {
            clonedObject[key] = clean(value, onlyUndefined);
        }
    }

    return clonedObject;
}


/**
 * Flips the keys and the values of the object.
 * The values must be `string`s or `number`s.
 *
 * ```
 * const a = {
 *   b: 'c',
 *   d: 'e',
 *   f: 1,
 *   g: true, // ignored
 * } as const;
 *
 * flip(a) -> {
 *   c: 'b',
 *   e: 'd',
 *   1: 'f',
 * }
 * ```
 *
 * @param obj
 * @returns
 */
export const flip = <
    T extends Record<PropertyKey, PropertyKey>,
>(
    obj: T,
): InvertResult<T> => Object.entries(obj).reduce(
    (flip, entry) => {
        const [
            key,
            value,
        ] = entry;

        if (
            typeof value !== 'string'
            && typeof value !== 'number'
        ) {
            return flip;
        }

        (flip as Record<string, any>)[value] = key;
        return flip;
    },
    {} as InvertResult<T>,
);


/**
 * Merges `target` into `object`.
 *
 * The `resolvers` can be used to resolve any field within the `object`
 * using dot-access syntax, e.g. `{ 'key1.key1.key3': () => value }`.
 *
 * @param object
 * @param target
 * @param resolvers
 * @param trunk
 * @returns
 */
export const merge = <O extends object = any, R = O>(
    object: O,
    target: RecursivePartial<O>,
    resolvers: Partial<
        Record<
            NestedKeyOf<O>, any | (() => any)
        >
    > = {} as any,
    trunk?: string,
): R => {
    const resolverMap = resolvers as Record<string, any>;

    // Only recurse into PLAIN objects; Date/Map/Set/RegExp/class instances are leaf values
    // (merge them by reference, don't rebuild them as `{}`).
    const isMergeable = (value: any): boolean =>
        isObject(value)
        && (value.constructor === Object || value.constructor === undefined);

    /**
     * Recurse on the sub-nodes themselves (NOT a re-walk from the root via `getNested` per
     * key) so the merge is O(total keys) instead of O(keys × depth); and union BOTH sides'
     * keys at each level so a field present in `target` but absent from `object` is KEPT
     * rather than silently dropped (the previous version iterated only `object`'s keys).
     */
    const mergeNode = (
        objectNode: any,
        targetNode: any,
        path?: string,
    ): any => {
        if (!isMergeable(objectNode) && !isMergeable(targetNode)) {
            return typeof targetNode !== 'undefined' ? targetNode : objectNode;
        }

        const result: any = {};
        const keys = new Set<string>([
            ...(isObject(objectNode) ? Object.keys(objectNode) : []),
            ...(isObject(targetNode) ? Object.keys(targetNode) : []),
        ]);

        for (const key of keys) {
            const keyPath = path ? path + '.' + key : key;

            // Use `in` so a resolver value of `0` / `false` / `''` is honored (not skipped).
            if (keyPath in resolverMap) {
                const resolver = resolverMap[keyPath];
                result[key] = typeof resolver === 'function' ? resolver() : resolver;
                continue;
            }

            const objectField = isObject(objectNode) ? objectNode[key] : undefined;
            const targetField = isObject(targetNode) ? targetNode[key] : undefined;

            if (isMergeable(objectField) || isMergeable(targetField)) {
                result[key] = mergeNode(objectField, targetField, keyPath);
                continue;
            }

            result[key] = typeof targetField !== 'undefined'
                ? targetField
                : objectField;
        }

        return result;
    };

    const objectStart = trunk ? getNested(object, trunk) : object;
    const targetStart = trunk ? getNested(target, trunk) : target;

    return mergeNode(objectStart, targetStart, trunk) as R;
}


/**
 * Check `target` equals `object` based on `object`s keys.
 *
 * @param object
 * @param target
 * @param trunk
 * @returns
 */
export const equals = <O = any>(
    object: O,
    target: O,
    trunk?: string,
): boolean => {
    const keysObject = trunk
        ? getNested(object, trunk)
        : object;

    for (const key in keysObject) {
        const path = trunk
            ? trunk + '.' + key
            : key;

        const valueObject = getNested(object, path);
        const valueTarget = getNested(target, path);

        if (isObject(valueObject)) {
            const equal = equals(
                object,
                target,
                path,
            );

            if (!equal) {
                return false;
            }

            continue;
        }

        if (valueObject !== valueTarget) {
            return false;
        }
    }

    return true;
}


export const omit = <
    O extends Record<string, any>,
    K extends NestedKeyOf<O> | NestedKeyOf<O>[],
>(
    object: O,
    keys: K,
    trunk?: string,
): RecursiveOmit<O, K> => {
    const result: any = {};

    const keysObject = trunk
        ? getNested(object, trunk)
        : object;

    for (const key in keysObject) {
        const path = trunk
            ? trunk + '.' + key as NestedKeyOf<O>
            : key as NestedKeyOf<O>;

        if (typeof keys === 'string') {
            if (keys === path) {
                continue;
            }
        } else if (keys.includes(path)) {
            continue;
        }

        const field = getNested(object, path);

        if (isObject(field)) {
            const value = omit(
                object,
                keys,
                path as any,
            );

            result[key] = value;
            continue;
        }

        result[key] = field;
    }

    return result;
}
// #endregion module
