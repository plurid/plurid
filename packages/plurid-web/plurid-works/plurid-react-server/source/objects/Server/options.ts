// #region imports
    // #region libraries
    import express from 'express';
    // #endregion libraries


    // #region external
    import {
        ServerRequest,
        DebugLevels,
        PluridServerOptions,
        PluridServerPartialOptions,
    } from '~data/interfaces';

    import {
        environment,
        defaultStillerOptions,
        DEFAULT_SERVER_OPTIONS,
    } from '~data/constants';
    // #endregion external
// #endregion imports



// #region module
/** The resolved options: every field defaulted (debug `error` in production, `info` otherwise). */
export const resolveServerOptions = (
    partialOptions?: PluridServerPartialOptions,
) => {
    const options: PluridServerOptions = {
        serverName: partialOptions?.serverName || DEFAULT_SERVER_OPTIONS.SERVER_NAME,
        hostname: partialOptions?.hostname || DEFAULT_SERVER_OPTIONS.HOSTNAME,
        quiet: partialOptions?.quiet || DEFAULT_SERVER_OPTIONS.QUIET,
        debug: partialOptions?.debug
            ? partialOptions?.debug
            : environment.production ? 'error' : 'info',
        compression: partialOptions?.compression ?? DEFAULT_SERVER_OPTIONS.COMPRESSION,
        open: partialOptions?.open ?? DEFAULT_SERVER_OPTIONS.OPEN,
        buildDirectory: partialOptions?.buildDirectory || DEFAULT_SERVER_OPTIONS.BUILD_DIRECTORY,
        assetsDirectory: partialOptions?.assetsDirectory || DEFAULT_SERVER_OPTIONS.ASSETS_DIRECTORY,
        publicDirectory: partialOptions?.publicDirectory || '',
        gatewayEndpoint: partialOptions?.gatewayEndpoint || DEFAULT_SERVER_OPTIONS.GATEWAY,
        staticCache: partialOptions?.staticCache || 0,
        ignore: partialOptions?.ignore || [],
        stillsDirectory: partialOptions?.stillsDirectory || DEFAULT_SERVER_OPTIONS.STILLS_DIRECTORY,
        stiller: partialOptions?.stiller || defaultStillerOptions,
        attachSignalHandlers: partialOptions?.attachSignalHandlers ?? true,
    };
    return options;
};


/** Whether a message of `level` is printed under these options. */
export const debugAllows = (
    options: PluridServerOptions,
    level: DebugLevels,
) => {
    if (options.quiet) {
        return false;
    }

    if (options.debug === 'none') {
        return false;
    }

    switch (level) {
        case 'error':
            return true;
        case 'warn':
            if (
                options.debug === 'error'
            ) {
                return false;
            }
            return true;
        case 'info':
            if (
                options.debug === 'error'
                || options.debug === 'warn'
            ) {
                return false;
            }

            return true;
        default:
            return false;
    }
};


/** ` in N ms` since the request was stamped, for the log lines. */
export const computeRequestTime = (
    request: express.Request,
) => {
    const requestTime = (request as ServerRequest).requestTime;

    if (!requestTime) {
        return '';
    }

    const now = Date.now();
    const difference = now - requestTime;

    return ` in ${difference} ms`;
};
// #endregion module
