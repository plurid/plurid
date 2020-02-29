import {
    ParserOptions,
    ParserPartialOptions,
    ParserResponse,
} from './interfaces';

import {
    extractParameters,
    extractQuery,
    extractFragments,
} from './logic';

import {
    Route,
} from '../Router/interfaces';



export default class Parser<T> {
    private location: string;
    private route: Route<T>;
    private options: ParserOptions;


    constructor(
        location: string,
        route: Route<T>,
        options?: ParserPartialOptions,
    ) {
        this.location = location;
        this.route = route;
        this.options = this.handleOptions(options);
    }


    private handleOptions(
        options: ParserPartialOptions | undefined,
    ) {
        const parserOptions: ParserOptions = {
            fragment: options?.fragment || true,
        };

        return parserOptions;
    }


    /**
     * Extract pathname, parameters, query, and fragment, if available.
     */
    public extract() {
        const {
            location,
        } = this.route;

        const parameters = extractParameters(
            this.location,
            location,
        );
        const query = extractQuery(
            location,
        );
        const fragments = extractFragments(
            location,
        );

        const parserResponse: ParserResponse<T> = {
            route: this.route,
            parameters,
            query,
            fragments,
        };

        return parserResponse;
    }
}
