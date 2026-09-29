// #region module
/**
 * DEVELOPMENT OR PRODUCTION, AS THE HOST'S BUNDLER DECIDES IT.
 *
 * The test is written as exactly `process.env.NODE_ENV` because that member chain is what Vite,
 * webpack and esbuild's `define` replace when the host builds. A guard in front of it
 * (`typeof process !== 'undefined' && …`) is false in a browser, which has no `process`, so a Vite
 * application never saw a development warning; and `process.env?.NODE_ENV` is a chain no `define`
 * matches, so a production build printed them. Node (a server, jest) reads the real variable. With
 * neither (an unbundled page), it is development.
 */
export const isProduction = (): boolean => {
    try {
        return process.env.NODE_ENV === 'production';
    } catch (_) {
        return false;
    }
};

export const isDevelopment = (): boolean => !isProduction();
// #endregion module
