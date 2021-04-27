// #region imports
    // #region libraries
    import {
        Indexed,
        PluridRoute,
        PluridRouteFragments,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export type ParserPartialOptions = Partial<ParserOptions>;


export interface ParserOptions {
    /**
     * Allow the parsing of fragments. Default `true`.
     */
    fragment: boolean;
}


export interface ParserResponse<C> {
    path: PluridRoute<C>;
    pathname: string;
    elements: string[];
    match: boolean;
    parameters: Indexed<string>;
    query: Indexed<string>;
    fragments: PluridRouteFragments;
    route: string;
}


export interface ParserParametersAndMatch {
    match: boolean;
    parameters: Indexed<string>
    elements: string[];
}
// #endregion module
