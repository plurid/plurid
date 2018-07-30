/**
 * Gets a string and returns it with capitalized first letter.
 *
 * @param {string} string
 * @return {function}
 */
export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
