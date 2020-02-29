import {
    Indexed,
} from '@plurid/plurid-data';

import {
    Route,
    Fragments,
} from '../Router/interfaces';



export type ParserPartialOptions = Partial<ParserOptions>;


export interface ParserOptions {
    /**
     * Allow the parsing of fragments. Default `true`.
     */
    fragment: boolean;
}


export interface ParserResponse<T> {
    route: Route<T>;
    parameters: Indexed<string>;
    query: Indexed<string>;
    fragments: Fragments;
}



// export interface ParsedLink {
//     path: string;
//     query?: RouteQuery;
//     fragments?: LinkFragments;
// }

// export interface LinkFragments {
//     texts: LinkFragmentText[];
//     elements: LinkFragmentElement[];
// }

// export interface LinkFragment {
//     type: string;
// }

// export interface LinkFragmentText extends LinkFragment {
//     type: 'text';
//     start: string;
//     end: string;
//     occurence: number;
// }

// export interface LinkFragmentElement extends LinkFragment {
//     type: 'element';
//     id: string;
//     occurence: number;
// }
