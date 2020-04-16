import {
    Indexed,
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    Fragments,
} from '../Router/interfaces';



export type MatcherPartialOptions = Partial<MatcherOptions>;


export interface MatcherOptions {
}


export interface MatcherResponse {
    path: PluridRouterPath;
    pathname: string;
    parameters: Indexed<string>;
    query: Indexed<string>;
    fragments: Fragments;
}
