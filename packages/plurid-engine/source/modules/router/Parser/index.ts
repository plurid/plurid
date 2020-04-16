import {
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    ParserOptions,
    ParserPartialOptions,
    ParserResponse,
} from './interfaces';

import {
    extractPathname,
    extractParametersAndMatch,
    extractQuery,
    extractFragments,
} from './logic';

// import {
//     Route,
// } from '../Router/interfaces';



export default class Parser<T> {
    /** properties */
    private location: string;
    private path: PluridRouterPath;
    private options: ParserOptions;


    /** constructor */
    constructor(
        location: string,
        path: PluridRouterPath,
        options?: ParserPartialOptions,
    ) {
        this.location = location;
        this.path = path;
        this.options = this.handleOptions(options);
    }


    /** private */
    private handleOptions(
        options: ParserPartialOptions | undefined,
    ) {
        const parserOptions: ParserOptions = {
            fragment: options?.fragment || true,
        };

        return parserOptions;
    }

    private extractPathname() {
        const pathname = extractPathname(
            this.location,
        );
        return pathname;
    }

    private extractParametersAndMatch() {
        const parametersAndMatch = extractParametersAndMatch(
            this.location,
            this.path.value,
        );

        return parametersAndMatch;
    }

    private extractQuery() {
        const query = extractQuery(
            this.location,
        );
        return query;
    }

    private extractFragments() {
        const fragments = this.options.fragment
            ? extractFragments(this.location)
            : extractFragments();
        return fragments;
    }


    /** public */
    /**
     * Extract pathname, parameters, query, and fragment, if available.
     */
    public extract() {
        const pathname = this.extractPathname();
        const {
            match,
            parameters,
            elements,
        } = this.extractParametersAndMatch();
        const query = this.extractQuery();
        const fragments = this.extractFragments();

        const parserResponse: ParserResponse = {
            path: this.path,
            pathname,
            elements,
            match,
            parameters,
            query,
            fragments,
        };

        return parserResponse;
    }
}
