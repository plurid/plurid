import {
    MatcherOptions,
    MatcherPartialOptions,
    MatcherResponse,
} from './interfaces';

import {
    Route,
} from '../Router/interfaces';

import Parser from '../Parser';

import {
    checkLengths,
} from './logic';



export default class Matcher<T> {
    private location: string;
    private route: Route<T>;
    private options: MatcherOptions;
    private matchedData: MatcherResponse<T> | undefined;


    constructor(
        location: string,
        route: Route<T>,
        options?: MatcherPartialOptions,
    ) {
        this.location = location;
        this.route = route;
        this.options = this.handleOptions(options);

        this.checkMatch();
    }


    private handleOptions(
        options: MatcherPartialOptions | undefined,
    ) {
        const matcherOptions: MatcherOptions = {
        };
        return matcherOptions;
    }

    private checkMatch() {
        const parsedLocation = new Parser(
            this.location,
            this.route,
        );
        const parserResponse = parsedLocation.extract();

        if (parserResponse.match) {
            const checkedLength = checkLengths(parserResponse);

            if (checkedLength) {
                const {
                    route,
                    pathname,
                    parameters,
                    query,
                    fragments,
                } = parserResponse;

                const matcherResponse: MatcherResponse<T> = {
                    route,
                    pathname,
                    parameters,
                    query,
                    fragments,
                };

                this.matchedData = matcherResponse;
            }
        }
    }


    /**
     * Extract pathname, parameters, query, and fragment, if available.
     */
    public data() {
        return this.matchedData;
    }
}
