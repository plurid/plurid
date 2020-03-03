import {
    Indexed,
    PluridRouterRoute,
} from '@plurid/plurid-data';

import {
    Fragments,
} from '../Router/interfaces';



export type MatcherPartialOptions = Partial<MatcherOptions>;


export interface MatcherOptions {
}


export interface MatcherResponse<T> {
    route: PluridRouterRoute<T>;
    pathname: string;
    parameters: Indexed<string>;
    query: Indexed<string>;
    fragments: Fragments;
}
