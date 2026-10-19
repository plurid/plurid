// #region module
export const cleanPathElement = (
    path: string,
) => {
    if (path[0] === '/') {
        return path.slice(1);
    }

    return path;
}


/**
 * Development unless the host's bundler or Node says production. Written as exactly
 * `process.env.NODE_ENV`, the chain a bundler's `define` replaces, as the bus does since 2026-09-29
 * (here 2026-10-19): behind a `typeof process` guard a browser build, which has no `process`, always
 * read as development, and `process.env?.NODE_ENV` matched no `define`, so the engine's warnings
 * printed in production. With neither (an unbundled page), development.
 */
export const isDevelopment = (): boolean => {
    try {
        return process.env.NODE_ENV !== 'production';
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
