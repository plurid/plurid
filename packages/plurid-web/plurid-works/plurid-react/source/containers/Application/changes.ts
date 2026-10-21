// #region module
/**
 * WHAT A HOST'S REBUILT PROPS CHANGE (2026-10-21). A new `configuration` object, even with the same
 * content, was laid whole over the live configuration, and every recompute put the `view` prop back:
 * a host that rebuilt its configuration on a resize lost the planes the reader added and the layout
 * set at runtime.
 */
const isPlain = (value: unknown): value is Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || '$$typeof' in value) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};


/**
 * Equal content: plain objects and arrays compared deeply, other values with `Object.is`. Two
 * functions are equal (a callback rebuilt on each render is the same setting); any other object (a
 * React element, a class instance) is equal only to itself.
 */
export const sameContent = (
    a: unknown,
    b: unknown,
    seen = new Map<object, object>(),
): boolean => {
    if (Object.is(a, b)) {
        return true;
    }
    if (typeof a === 'function' && typeof b === 'function') {
        return true;
    }
    const arrays = Array.isArray(a) && Array.isArray(b);
    if (!arrays && !(isPlain(a) && isPlain(b))) {
        return false;
    }
    // a cycle is equal where it closes
    if (seen.get(a as object) === b) {
        return true;
    }
    seen.set(a as object, b as object);
    if (arrays) {
        const left = a as unknown[];
        const right = b as unknown[];
        return left.length === right.length
            && left.every((item, index) => sameContent(item, right[index], seen));
    }
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length
        && keys.every((key) => Object.prototype.hasOwnProperty.call(right, key)
            && sameContent(left[key], right[key], seen));
};


/**
 * The engine's merge reads these whole (a look or a theme is a name or an object; a named bridge
 * preset applies under the fields given beside it), so a change to any part takes all of it.
 */
const WHOLE = new Set([
    'global.look',
    'global.theme',
    'space.bridge',
]);

/**
 * The parts of `next` that differ from `previous`: each changed leaf, a rebuilt callback, and a part
 * the merge reads whole, as one. `undefined` when nothing changed. A key `next` leaves out stays as
 * it is, as it always did.
 */
export const configurationChanges = (
    previous: unknown,
    next: unknown,
    trunk = '',
): Record<string, unknown> | undefined => {
    if (!isPlain(next)) {
        return undefined;
    }
    const changes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(next)) {
        if (value === undefined) {
            continue;
        }
        const path = trunk ? trunk + '.' + key : key;
        const before = isPlain(previous) ? previous[key] : undefined;
        if (!WHOLE.has(path) && isPlain(value) && isPlain(before)) {
            const nested = configurationChanges(before, value, path);
            if (nested) {
                changes[key] = nested;
            }
            continue;
        }
        const same = typeof value === 'function'
            ? value === before
            : sameContent(value, before);
        if (!same) {
            changes[key] = value;
        }
    }
    return Object.keys(changes).length ? changes : undefined;
};


/**
 * A copy of the plain data a prop holds, functions and other objects by reference: what was applied,
 * kept apart from the host's object, so an edit made in place to it (then passed under a new object)
 * still reads as a change (2026-10-22).
 */
export const snapshot = <T>(
    value: T,
    seen = new Map<object, unknown>(),
): T => {
    if (!Array.isArray(value) && !isPlain(value)) {
        return value;
    }
    if (seen.has(value as object)) {
        return seen.get(value as object) as T;
    }
    if (Array.isArray(value)) {
        const copy: unknown[] = [];
        seen.set(value, copy);
        for (const item of value) {
            copy.push(snapshot(item, seen));
        }
        return copy as T;
    }
    const copy: Record<string, unknown> = {};
    seen.set(value as object, copy);
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        copy[key] = snapshot(item, seen);
    }
    return copy as T;
};


/** Whether every change is a rebuilt callback, which the store takes without a recompute. */
export const onlyCallbacks = (
    changes: Record<string, unknown>,
): boolean => Object.values(changes).every((value) => typeof value === 'function'
    || (isPlain(value) && Object.keys(value).length > 0 && onlyCallbacks(value)));
// #endregion module
