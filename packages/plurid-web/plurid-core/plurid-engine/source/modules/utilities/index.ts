// #region module
export const cleanPathElement = (
    path: string,
) => {
    if (path[0] === '/') {
        return path.slice(1);
    }

    return path;
}


/** Development unless a bundler or Node says production (a bare browser has no `process`). */
export const isDevelopment = (): boolean => {
    try {
        return typeof process === 'undefined' || process.env?.NODE_ENV !== 'production';
    } catch {
        return true;
    }
};


const warned = new Set<string>();

/**
 * A HOST MISTAKE THE ENGINE RECOVERED FROM, said once: a development-only warning per `key`,
 * silenced by `development.warnings: false` (`enabled`). The engine falls back to something that
 * works (a layout, a default) rather than throwing or emptying the space, and this is how the host
 * learns its input was not taken as written.
 */
export const warnDevelopment = (
    key: string,
    message: string,
    enabled = true,
): void => {
    if (!enabled || warned.has(key) || !isDevelopment() || typeof console === 'undefined') {
        return;
    }
    warned.add(key);
    console.warn('[plurid] ' + message);
};
// #endregion module
