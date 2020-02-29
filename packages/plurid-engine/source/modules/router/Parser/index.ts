import {
    ParserOptions,
    ParserPartialOptions,
    ParserResponse,
} from './interfaces';

import {
    extractPathname,
    extractParameters,
    extractQuery,
    extractFragments,
} from './logic';

import {
    Route,
} from '../Router/interfaces';



export default class Parser<T> {
    /** properties */
    private location: string;
    private route: Route<T>;
    private options: ParserOptions;


    /** constructor */
    constructor(
        location: string,
        route: Route<T>,
        options?: ParserPartialOptions,
    ) {
        this.location = location;
        this.route = route;
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


    /** public */
    /**
     * Extract pathname, parameters, query, and fragment, if available.
     */
    public extract() {
        const pathname = extractPathname(
            this.location,
        );
        const parameters = extractParameters(
            this.location,
            this.route.location,
        );
        const query = extractQuery(
            this.location,
        );
        const fragments = extractFragments(
            this.location,
        );

        const parserResponse: ParserResponse<T> = {
            route: this.route,
            pathname,
            parameters,
            query,
            fragments,
        };

        return parserResponse;
    }
}
