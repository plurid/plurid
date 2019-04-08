/**
 * Gets a string and returns it with capitalized first letter.
 *
 * @param {string} str
 * @return {string}
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
