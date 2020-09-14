import {
    PluridRoute,
} from '@plurid/plurid-data';

import {
    MatcherOptions,
    MatcherPartialOptions,
    MatcherResponse,
} from './interfaces';

import Parser from '../Parser';

import {
    checkValidPath,
} from './logic';



export default class Matcher<T> {
    private location: string;
    private path: PluridRoute;
    private options: MatcherOptions;
    private matchedData: MatcherResponse | undefined;


    constructor(
        location: string,
        path: PluridRoute,
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
            const validPath = checkValidPath(parserResponse);

            if (validPath) {
                const matcherResponse: MatcherResponse = {
                    ...parserResponse,
                };
                this.matchedData = matcherResponse;
            } else {
                this.matchedData = undefined;
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
