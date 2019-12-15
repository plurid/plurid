/**
 * http://blog.nicohaemhouts.com/2015/08/03/accessing-nested-javascript-objects-with-string-key/
 *
 * @param theObject
 * @param path
 * @param separator
 */
export const getNested = (
    theObject: any,
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
                theObject,
            );
    } catch (err) {
        return undefined;
    }
}
