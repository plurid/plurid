// #region module
const seen = new Set<string>();

const isProduction = (): boolean => {
    try {
        return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
    } catch (_) {
        return false;
    }
};


/**
 * A development-only warning, printed once per key per page — for the mistakes a host makes
 * silently otherwise (an unstable `planes` identity, a view route that is not registered, a
 * container with no height…). Never in production; `development.warnings: false` mutes them.
 */
export const warnOnce = (
    key: string,
    message: string,
    enabled: boolean = true,
) => {
    if (!enabled || isProduction() || seen.has(key)) {
        return;
    }
    seen.add(key);
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('[plurid] ' + message);
    }
};


/** Testing hook: forget every warning issued so far. */
export const resetWarnings = () => {
    seen.clear();
};
// #endregion module
