import {
    PluridRouterPath,
    RouterFragments,
} from '@plurid/plurid-data';



export type MatcherPartialOptions = Partial<MatcherOptions>;


export interface MatcherOptions {
}


export interface MatcherResponse {
    path: PluridRouterPath;
    pathname: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
    fragments: RouterFragments;
    route: string;
}
