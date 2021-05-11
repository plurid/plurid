// #region module
export type RouterPartialOptions = Partial<RouterOptions>;


export interface RouterOptions {
    /**
     * Number of the routes kept in cache. Default `1000`.
     */
    cacheLimit: number;
    gateway: string | undefined;
}
// #endregion module
