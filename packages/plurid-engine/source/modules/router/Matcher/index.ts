import {
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    MatcherOptions,
    MatcherPartialOptions,
    MatcherResponse,
} from './interfaces';

// import {
//     Route,
// } from '../Router/interfaces';

import Parser from '../Parser';

import {
    checkLengths,
} from './logic';



export default class Matcher<T> {
    private location: string;
    private path: PluridRouterPath;
    private options: MatcherOptions;
    private matchedData: MatcherResponse | undefined;


    constructor(
        location: string,
        path: PluridRouterPath,
        options?: MatcherPartialOptions,
    ) {
        this.location = location;
        this.path = path;
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
            this.path,
        );
        const parserResponse = parsedLocation.extract();

        if (parserResponse.match) {
            const checkedLength = checkLengths(parserResponse);

            if (checkedLength) {
                const {
                    path,
                    pathname,
                    parameters,
                    query,
                    fragments,
                } = parserResponse;

                const matcherResponse: MatcherResponse = {
                    path,
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
