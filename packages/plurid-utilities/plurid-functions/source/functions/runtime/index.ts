// #region module
/**
 * Based on https://stackoverflow.com/a/38815760
 */
export const isBrowser = typeof window !== 'undefined'
    && ({}).toString.call(window) === '[object Window]';

// `globalThis` (universal) instead of the Node-only `global` — in Node it still tags as `[object global]`,
// in the browser it is the window (`[object Window]`), so the discriminator is preserved without @types/node.
export const isNode = typeof globalThis !== 'undefined'
    && ({}).toString.call(globalThis) === '[object global]';
// #endregion module
