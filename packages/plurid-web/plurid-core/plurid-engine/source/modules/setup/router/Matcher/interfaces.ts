// #region imports
    // #region libraries
    import {
        PluridRoute,
        PluridRouteFragments,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export type MatcherPartialOptions = Partial<MatcherOptions>;


export interface MatcherOptions {
}


export interface MatcherResponse {
    path: PluridRoute;
    pathname: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
    fragments: PluridRouteFragments;
    route: string;
}
// #endregion module
