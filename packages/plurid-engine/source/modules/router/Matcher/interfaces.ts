import {
    Indexed,
} from '@plurid/plurid-data';

import {
    Route,
    Fragments,
} from '../Router/interfaces';



export type MatcherPartialOptions = Partial<MatcherOptions>;


export interface MatcherOptions {
}


export interface MatcherResponse<T> {
    route: Route<T>;
    pathname: string;
    parameters: Indexed<string>;
    query: Indexed<string>;
    fragments: Fragments;
}
