import {
    Indexed,
    PluridRouterPath,
    RouterFragments,
} from '@plurid/plurid-data';



export type ParserPartialOptions = Partial<ParserOptions>;


export interface ParserOptions {
    /**
     * Allow the parsing of fragments. Default `true`.
     */
    fragment: boolean;
}


export interface ParserResponse {
    path: PluridRouterPath;
    pathname: string;
    elements: string[];
    match: boolean;
    parameters: Indexed<string>;
    query: Indexed<string>;
    fragments: RouterFragments;
    route: string;
}


export interface ParserParametersAndMatch {
    match: boolean;
    parameters: Indexed<string>
    elements: string[];
}
