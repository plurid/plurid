// #region imports
    // #region external
    import {
        PluridLiveServerOptions,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
class LiveServer {
    private options: PluridLiveServerOptions;


    constructor(
        options?: Partial<PluridLiveServerOptions>,
    ) {
        this.options = this.resolveOptions(options);
    }


    private resolveOptions = (
        options?: Partial<PluridLiveServerOptions>,
    ) => {
        const defaultServerPath = './source/server/index.ts';

        const resolvedOptions = {
            server: options?.server || defaultServerPath,
        };

        return resolvedOptions;
    }


    public start() {

    }
}
// #endregion module



// #region exports
export default LiveServer;
// #endregion exports
