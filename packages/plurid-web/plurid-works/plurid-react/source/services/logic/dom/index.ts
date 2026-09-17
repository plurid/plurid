// #region module
const fnv1a = (
    value: string,
): number => {
    let hash = 0x811c9dc5;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
};


/**
 * A DOM id for a plane: short, stable, id-safe. A plane id (`plurid://host/docs?x=1@2`) is not a
 * DOM id: it carries a scheme, slashes, a query and an ordinal, so `#<id>` never selected anything
 * and the ids leaked the routes into the document. `data-plurid-plane` keeps the plane id itself.
 */
export const domID = (
    planeID: string,
): string => 'plurid-' + fnv1a(planeID).toString(36);
// #endregion module
